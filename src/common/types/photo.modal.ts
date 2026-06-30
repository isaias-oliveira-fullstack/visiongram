import type { PostCard } from "./posts"

/**
 * Alias de tipo para os diferentes estágios do photo-modal.
 */
export type PhotoModalStage = 'create-post' | 'edit-post-adjustments' | 'edit-post-form' | 'sharing-post' | 'post-shared' | 'post-failed'

/**
 * Alias de tipo para as diferentes abas do photo-modal.
 */
export type PhotoModalTab = 'adjustments-tab' | 'filters-tab'

/**
 * Alias de tipo para uma imagem no photo-modal.
 */
export type PhotoModalImage = string | null

/**
 * Interface para um filtro aplicado a uma imagem.
 */
export interface PhotoModalImageFilter {
    filterName: string // Nome do filtro
    filterClass: string // Classe CSS para aplicar o filtro
    displayName: string // Valor exibido do filtro
}

/**
 * Interface para os ajustes de uma imagem.
 */
export interface PhotoModalAdjustment {
    brightness: {
        label: string // Rótulo do ajuste de brilho
        level: number | string // Nível do ajuste de brilho
    }
    contrast: {
        label: string // Rótulo do ajuste de contraste
        level: number | string // Nível do ajuste de contraste
    }
    saturation: {
        label: string // Rótulo do ajuste de saturação
        level: number | string // Nível do ajuste de saturação
    }
}

/**
 * Interface para os dados do formulário de uma imagem.
 */
export interface PhotoModalImageForm {
    caption: string // Legenda da imagem
    location: string // Localização da imagem
}



/**
 * Interface representando as props do componente Post Comment Modal
 */
export interface PostCommentModal {
    /** Flag para alternar a visibilidade do modal */
    isToggled?: boolean
  
    /** O post associado ao modal de comentários */
    post: PostCard
  }

/**
 * Alias de tipo representando uma referência a um elemento input HTML.
 */
export type HTMLInputElementRef = InstanceType<typeof HTMLInputElement>