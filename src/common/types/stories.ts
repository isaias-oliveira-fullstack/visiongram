import type { PostMedia } from "./posts"

/**
 * Alias de tipo para os elementos de mídia suportados em uma story.
 */
export type StoryMedia =  HTMLVideoElement | HTMLImageElement | undefined

/**
 * Tipo que representa os possíveis tipos de uma story.
 * - 'Image': A story contém uma imagem.
 * - 'Video': A story contém um vídeo.
 * - null: O tipo da story não foi determinado ou não é suportado.
 */
export type StoryType = 'Image' | 'Video' | null


/**
 * Interface do modal de carrossel de stories
 */
export interface StoryCarousel {
    /** Story UUID */
    id: number

    /** Nome de usuário do usuário */
    userName: string
  
    /** URL da foto de perfil do usuário */
    profilePictureUrl: string

    /** O momento em que o carrossel da story expira */
    expiringAt: string
    
    /** Indica se o usuário visualizou o carrossel da story */
    seen: boolean

    /** Indica se o usuário atual curtiu a story */
    hasLiked: boolean
    
    /** A lista de itens de mídia no carrossel da story */
    items: PostMedia[]
    
    /** O número total de itens de mídia no carrossel da story */
    mediaCount: number
}

