import prisma from '../../database/prisma'
import { AppError } from '../../shared/errors'
import { CommentService } from '../comments/comment.service'

interface CreatePostInput {
  content: string
  imageUrl?: string
  mediaUrl?: string
  mediaType?: string
  thumbnailUrl?: string
  userId: string
  hideLikes?: boolean
  disableComments?: boolean
}

export class PostService {
  private commentService = new CommentService()

  private async enrichPostWithUserData(post: any, currentUserId?: string) {
    const isSaved = currentUserId && post.savedBy
      ? post.savedBy.some((save: any) => save.userId === currentUserId)
      : false
    
    return {
      ...post,
      isSaved,
      savedBy: undefined
    }
  }

  async create(data: CreatePostInput) {
    const resolvedMediaUrl = data.mediaUrl ?? data.imageUrl ?? null
    const resolvedMediaType = data.mediaType ?? (data.imageUrl ? 'image' : null)

    return prisma.post.create({
      data: {
        content: data.content,
        imageUrl: data.imageUrl ?? null,
        mediaUrl: resolvedMediaUrl,
        mediaType: resolvedMediaType,
        thumbnailUrl: data.thumbnailUrl ?? null,
        hideLikes: data.hideLikes ?? false,
        disableComments: data.disableComments ?? false,
        userId: data.userId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true
          }
        },
        likes: true,
        savedBy: true,
        comments: {
          where: { parentCommentId: null },
          select: {
            id: true,
            content: true,
            createdAt: true,
            parentCommentId: true,
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true
              }
            },
            replies: {
              orderBy: { createdAt: 'asc' },
              select: {
                id: true,
                content: true,
                createdAt: true,
                parentCommentId: true,
                user: {
                  select: {
                    id: true,
                    name: true,
                    username: true,
                    avatar: true
                  }
                }
              }
            }
          }
        }
      }
    })
  }

  async findAll(currentUserId?: string) {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true
          }
        },
        likes: true,
        savedBy: true,
        comments: {
          where: { parentCommentId: null },
          select: {
            id: true,
            content: true,
            createdAt: true,
            parentCommentId: true,
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true
              }
            },
            replies: {
              orderBy: { createdAt: 'asc' },
              select: {
                id: true,
                content: true,
                createdAt: true,
                parentCommentId: true,
                user: {
                  select: {
                    id: true,
                    name: true,
                    username: true,
                    avatar: true
                  }
                }
              }
            }
          }
        }
      }
    })

    return Promise.all(posts.map((post) => this.enrichPostWithUserData(post, currentUserId)))
  }

  async findByUsername(username: string, currentUserId?: string) {
    const posts = await prisma.post.findMany({
      where: {
        user: {
          username
        }
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true
          }
        },
        likes: true,
        savedBy: true,
        comments: {
          where: { parentCommentId: null },
          select: {
            id: true,
            content: true,
            createdAt: true,
            parentCommentId: true,
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true
              }
            },
            replies: {
              orderBy: { createdAt: 'asc' },
              select: {
                id: true,
                content: true,
                createdAt: true,
                parentCommentId: true,
                user: {
                  select: {
                    id: true,
                    name: true,
                    username: true,
                    avatar: true
                  }
                }
              }
            }
          }
        }
      }
    })

    return Promise.all(posts.map((post) => this.enrichPostWithUserData(post, currentUserId)))
  }

  async findOne(id: string, currentUserId?: string) {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true
          }
        },
        likes: true,
        savedBy: true
      }
    })

    if (!post) {
      throw new AppError('Post not found', 404)
    }

    const comments = await this.commentService.findAll(id)
    
    const isSaved = currentUserId 
      ? post.savedBy.some(save => save.userId === currentUserId)
      : false

    return { ...post, comments, isSaved, savedBy: undefined }
  }

  async delete(id: string, userId: string) {
    const post = await prisma.post.findUnique({ where: { id } })
    if (!post) {
      throw new AppError('Post not found', 404)
    }
    if (post.userId !== userId) {
      throw new AppError('Not authorized to delete this post', 403)
    }

    await prisma.comment.deleteMany({ where: { postId: id } })
    await prisma.like.deleteMany({ where: { postId: id } })

    return prisma.post.delete({ where: { id } })
  }

  async update(id: string, userId: string, data: { content?: string; imageUrl?: string; mediaUrl?: string; mediaType?: string; thumbnailUrl?: string; hideLikes?: boolean; disableComments?: boolean }) {
    const post = await prisma.post.findUnique({
      where: { id },
      select: {
        id: true,
        content: true,
        imageUrl: true,
        mediaUrl: true,
        mediaType: true,
        thumbnailUrl: true,
        userId: true,
        hideLikes: true,
        disableComments: true
      }
    })
    if (!post) {
      throw new AppError('Post not found', 404)
    }
    if (post.userId !== userId) {
      throw new AppError('Not authorized to edit this post', 403)
    }

    return prisma.post.update({
      where: { id },
      data: {
        content: data.content ?? post.content,
        imageUrl: data.imageUrl ?? post.imageUrl,
        mediaUrl: data.mediaUrl ?? post.mediaUrl,
        mediaType: data.mediaType ?? post.mediaType,
        thumbnailUrl: data.thumbnailUrl ?? post.thumbnailUrl,
        hideLikes: data.hideLikes ?? post.hideLikes,
        disableComments: data.disableComments ?? post.disableComments
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true
          }
        },
        likes: true,
        savedBy: true,
        comments: {
          where: { parentCommentId: null },
          select: {
            id: true,
            content: true,
            createdAt: true,
            parentCommentId: true,
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true
              }
            },
            replies: {
              orderBy: { createdAt: 'asc' },
              select: {
                id: true,
                content: true,
                createdAt: true,
                parentCommentId: true,
                user: {
                  select: {
                    id: true,
                    name: true,
                    username: true,
                    avatar: true
                  }
                }
              }
            }
          }
        }
      }
    })
  }
}
