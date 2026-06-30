import { Request, Response } from 'express'
import { PostService } from './post.service'
import probe from 'probe-image-size'

export class PostController {
  private postService = new PostService()

  async create(req: Request, res: Response) {
    const { content, imageUrl, mediaUrl, mediaType, thumbnailUrl, hideLikes, disableComments } = req.body
    const userId = req.user.id

    const post = await this.postService.create({ content, imageUrl, mediaUrl, mediaType, thumbnailUrl, userId, hideLikes, disableComments })
    return res.status(201).json(post)
  }

  async findAll(req: Request, res: Response) {
    const username = req.query.username as string | undefined
    const currentUserId = req.user?.id
    if (username) {
      const posts = await this.postService.findByUsername(username, currentUserId)
      return res.json(posts)
    }

    const posts = await this.postService.findAll(currentUserId)
    return res.json(posts)
  }

  async findOne(req: Request, res: Response) {
    const currentUserId = req.user?.id
    const post = await this.postService.findOne(req.params.id, currentUserId)
    return res.json(post)
  }

  async update(req: Request, res: Response) {
    const { content, imageUrl, mediaUrl, mediaType, thumbnailUrl, hideLikes, disableComments } = req.body
    const userId = req.user.id
    const post = await this.postService.update(req.params.id, userId, {
      content,
      imageUrl,
      mediaUrl,
      mediaType,
      thumbnailUrl,
      hideLikes,
      disableComments
    })
    return res.json(post)
  }

  async delete(req: Request, res: Response) {
    const post = await this.postService.delete(req.params.id, req.user.id)
    return res.json(post)
  }

  async share(req: Request, res: Response) {
    const post: any = await this.postService.findOne(req.params.id)
    const frontendUrl = `${resolveFrontendUrl()}/p/${post.id}`
    const title = `@${post.user?.username ?? ''} on VisionGram`
    const description = (post.content && post.content.length > 0) ? post.content.substring(0, 300) : 'View this post on VisionGram.'
    const mediaUrl = post.mediaUrl ?? post.imageUrl ?? ''

    // Detecta o tipo de mídia e dimensões
    let ogType = 'article'
    let ogImage = ''
    let ogImageWidth = ''
    let ogImageHeight = ''
    let ogVideo = ''
    let ogVideoType = ''

    if (mediaUrl) {
      try {
        const result = await probe(mediaUrl)
        const { width, height, type, mime } = result
        if (mime && mime.startsWith('video')) {
          ogType = 'video'
          ogVideo = mediaUrl
          ogVideoType = mime
          // Também define a imagem de pré-visualização se disponível (alguns vídeos têm .thumbnail)
          ogImage = ''
        } else {
          ogType = 'article'
          ogImage = mediaUrl
          ogImageWidth = width ? String(width) : ''
          ogImageHeight = height ? String(height) : ''
        }
      } catch (e) {
        // Se a verificação falhar, usa os metadados básicos da imagem
        ogImage = mediaUrl
      }
    }

    const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <meta property="og:site_name" content="VisionGram" />
  <meta property="og:type" content="${escapeHtml(ogType)}" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:url" content="${escapeHtml(frontendUrl)}" />
  ${ogImage ? `<meta property="og:image" content="${escapeHtml(ogImage)}" />` : ''}
  ${ogImageWidth ? `<meta property="og:image:width" content="${escapeHtml(ogImageWidth)}" />` : ''}
  ${ogImageHeight ? `<meta property="og:image:height" content="${escapeHtml(ogImageHeight)}" />` : ''}
  ${ogVideo ? `<meta property="og:video" content="${escapeHtml(ogVideo)}" />` : ''}
  ${ogVideoType ? `<meta property="og:video:type" content="${escapeHtml(ogVideoType)}" />` : ''}

  <meta name="twitter:card" content="${ogVideo ? 'player' : 'summary_large_image'}" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  ${ogImage ? `<meta name="twitter:image" content="${escapeHtml(ogImage)}" />` : ''}
  ${ogVideo ? `<meta name="twitter:player" content="${escapeHtml(ogVideo)}" />` : ''}

  <meta name="robots" content="index,follow" />
  <meta http-equiv="refresh" content="1;url=${escapeHtml(frontendUrl)}" />
</head>
<body>
  <a href="${escapeHtml(frontendUrl)}">Open post on VisionGram</a>
</body>
</html>`

    res.setHeader('Content-Type', 'text/html')
    return res.status(200).send(html)
  }
}

function resolveFrontendUrl() {
  const configured = process.env.FRONTEND_URL?.trim()
  if (configured) {
    return configured.replace(/\/$/, '')
  }

  return 'http://localhost:5173'
}

function escapeHtml(str: any) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

