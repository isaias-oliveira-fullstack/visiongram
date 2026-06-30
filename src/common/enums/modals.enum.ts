/** Enum para tamanho do modal */
export enum ModalSize {
    /** Tamanho super pequeno do modal */
    SuperSmall = 'ss',

    /** Tamanho extra pequeno do modal */
    ExtraSmall = 'xs',
    
    /** Tamanho pequeno do modal */
    Small = 'sm',

    /** Tamanho médio do modal */
    Medium = 'md',

    /** Tamanho grande do modal */
    Large = 'lg',

    /** Tamanho extra grande do modal */
    ExtraLarge = 'xl'
}


/** Enum para tipos de modal */
export enum ModalName {
    PHOTO = 'photo-modal', // Representa o modal de foto
    FOLLOW = 'follow-modal', // Representa o modal de seguidores
    PROFILE = 'profile-modal', // Representa o modal de perfil
    SETTING = 'setting-modal', // Representa o modal de configurações
    COMMENT = 'comment-modal', // Representa o modal de comentários
    POST_OPTIONS = 'post-options-modal', // Representa o modal de opções do post
    GENDER = 'gender-modal', // Representa o modal de gênero
    PROFILE_SETTING = 'profile-setting-modal', // Representa o modal de configurações do perfil
    REEL = 'reel-modal', // Representa o modal de reel
    POST = 'post-modal' // Representa o modal de post
}
