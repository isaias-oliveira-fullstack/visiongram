
/**
 * Interface das estatísticas de perfil
 */
export interface ProfileStats {

    /**
     * Título das estatísticas, por exemplo "Seguidores" ou "Seguindo".
     */
    title: string

    /**
     * Quantidade da estatística, por exemplo "100" ou "200".
     */
    count: number

    /**
     * Ação a ser executada ao clicar na estatística
     */
    action: () => void
}

/**
 * Tipo de rótulo das abas do perfil
 */
export type ProfileTabLabel = 'TAGGED' | 'POSTS' | 'PEEDS' | 'SAVED' | 'MARCADOS' | 'PUBLICAÇÕES' | 'REELS' | 'SALVOS'

/**
 * Tipo de tamanho dos ícones das abas do perfil
 */
export type ProfileTabIconSize = 'profile-posts-large' | 'profile-posts-small' | 'profile-peed-large' | 'profile-peed-small' | 'profile-saved-large' | 'profile-saved-small' | 'profile-tagged-large' | 'profile-tagged-small'

/**
 * Tipo do nome das abas do perfil
 */
export type ProfileTabName = 'profile-posts' | 'profile-peed' | 'profile-saved' | 'profile-tagged'

/**
 * Interface de um elemento de aba do perfil
 */
export interface ProfileTabElement {

    /**
     * Nome da aba, por exemplo "Posts" ou "IGTV".
     */
    name: ProfileTabName

    /**
     * Rótulo da aba, por exemplo "Posts" ou "IGTV".
     */
    label: ProfileTabLabel

    /**
     * Ícone da aba
     */
    iconLarge: ProfileTabIconSize

    /**
     * Ícone pequeno da aba, se houver
     */
    iconSmall: ProfileTabIconSize

    /**
     * Ação executada ao clicar na aba
     */
    action: () => void
}