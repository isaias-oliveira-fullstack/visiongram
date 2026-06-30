/**
 * Interface para os itens da barra de navegação
 */
export interface NavBarItem {
    /** Título da página */
    title?: string

    /** Caminho da página */
    path: string

    /** Nome da página no roteador */
    name?: string

    /** Classe CSS personalizada, se houver, para o item */
    customClass?: string

    /** Nome do ícone, se houver, para o item */
    iconName?: string
    
    /** Classe do ícone Font Awesome, se houver, para o item */
    iconFaClass?: string

    /** Nome do ícone SVG, se houver, para o item */
    iconSvgName?: string

    /** Listener de evento, se houver, para o item */
    onClick?: () => void

    /** Imagem, se houver, para o item */
    img?: string
}

/**
 * Alias de tipo representando as opções de abas disponíveis para a barra de navegação.
 */
export type NavBarTabs = 'profile-posts' | 'profile-tagged' | 'profile-saved' | 'profile-peed'