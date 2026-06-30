import type { PostComment } from "./posts"

/**
 * Interface base para modelos de card
 */
export interface BaseCard {

    /** Um identificador único para o card atual */
    id?: string

    /** Nome de usuário do usuário */
    userName: string
  
    /** URL da foto de perfil */
    profilePictureUrl: string

    /** Timestamp Unix representando quando o card atual foi criado */
    createdAt?: string | number

    /** Legenda para o card atual */
    caption?: string
}


/**
 * Interface base para modelos de card de post
 */
export interface BasePostCard extends BaseCard {
    
  /** Número de curtidas para o card atual */
  likeCount: number

  /** Se o usuário atual curtiu o card atual */
  hasLiked: boolean

  /** Se o usuário atual segue o autor deste card */
  isFollowed: boolean

  /** Total de comentários no card atual */
  commentCount: number

  /** Um array de comentários no card atual */
  comments?: PostComment[]

  /** Se o usuário atual salvou o card atual */
  isSaved?: boolean
}


/**
 * Interface para o card de sugestão
 */
export interface SuggestionCard extends BaseCard {

    /** Informações sobre o usuário que está sendo sugerido para seguir. */
    suggested: {
        /** ID no banco de dados do usuário sugerido. */
        id?: string

        /** Nome de usuário do usuário sugerido para seguir. */
        userName: string

        /** URL da foto de perfil do usuário sugerido para seguir. */
        profilePictureUrl: string

        /** Nome de usuário do usuário que segue o usuário sugerido. */
        followedBy: string

        /** Se o usuário autenticado atual já segue esta sugestão. */
        isFollowing?: boolean
    }[]
}

/**
 * Interface para o card de busca
 */
export interface SearchCard extends BaseCard {
  /** Biografia do usuário */
  bio: string
}

/**
 * Interface para o card de notificação
 */
export interface NotificationCard extends BaseCard{

  /** Tipo de notificação */
  type: 'like' | 'follow' | 'comment',

  /** Se o usuário está seguindo o usuário atual */
  isFollowing?: boolean
}
