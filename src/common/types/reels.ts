import type { BasePostCard } from "./cards"

/**
 * Interface para uma única mídia em um reel
 */
export interface ReelMedia {
    /** Tipo da mídia */
    type: 'video' | 'image'

    /** URL da mídia */
    mediaUrl: string

    /** Poster ou miniatura opcional para mídia de vídeo */
    poster?: string

    /** Largura da mídia em pixels */
    width?: number

    /** Altura da mídia em pixels */
    height?: number

    /** Título/nome da mídia */
    title?: string

    /** Localização da mídia */
    location?: string
}


/**
 * Representa um único post de reel
 */
export interface ReelPost extends BasePostCard{
    reelMedia : ReelMedia
}

