import type { BasePostCard } from "./cards"

/**
 * Interface para uma única mídia de um post
 */
export interface PostMedia {
  id?: string
  /** Índice da mídia no carrossel */
  index: number
  /** Tipo de mídia, por exemplo: vídeo ou imagem */
  type: 'video' | 'image'
  /** Alias de tipo de mídia usado em todo o app */
  mediaType?: 'video' | 'image'
  /** URL da mídia */
  mediaUrl: string
  /** URL de poster/thumbnail para vídeos */
  poster?: string
  /** URL opcional de thumbnail para a mídia */
  thumbnailUrl?: string
  /** Largura da mídia em pixels */
  width?: number
  /** Altura da mídia em pixels */
  height?: number
  /** Título/nome da mídia */
  title?: string
}

export interface PostCard extends BasePostCard {
  /** Array de mídias no carrossel do post */
  carouselMedia?: PostMedia[]
  /** URL original da imagem do post */
  imageUrl?: string
  /** URL principal da mídia do post */
  mediaUrl?: string
  /** Tipo principal da mídia do post */
  mediaType?: 'image' | 'video'
  /** URL opcional de thumbnail para posts de vídeo */
  thumbnailUrl?: string
  /** ID do usuário dono do post */
  userId?: string
  /** Se a contagem de curtidas deve ficar oculta para os visualizadores */
  hideLikes?: boolean
  /** Se os comentários estão desabilitados para o post */
  disableComments?: boolean
}

/**
 * Interface para um único comentário de post
 */
export interface PostComment {
  /** UUID do comentário */
  id: string

  /** Nome de usuário do comentário */
  userName: string

  /** URL da foto do usuário do comentário */
  profilePictureUrl: string

  /** Conteúdo do comentário */
  content: string

  /** Timestamp Unix representando quando o comentário foi publicado */
  createdAt: string | number

  /** ID do comentário pai (null para comentários de topo) */
  parentCommentId?: string | null

  /** Respostas para este comentário */
  replies?: PostComment[]
}

/**
 * Interface para o card de comentário
 */
export interface PostCommentCard extends PostComment {}

/**
 * Interface para um único card de post
 */
export interface PostCard extends BasePostCard {
  /** Array de mídias no carrossel do post */
  carouselMedia?: PostMedia[]
  /** URL original da imagem do post */
  imageUrl?: string
  /** ID do usuário dono do post */
  userId?: string
  /** Se a contagem de curtidas deve ficar oculta para os visualizadores */
  hideLikes?: boolean
  /** Se os comentários estão desabilitados para o post */
  disableComments?: boolean
}