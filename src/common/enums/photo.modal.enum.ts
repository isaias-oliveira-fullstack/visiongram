/**
 * Enums para abas do photo-modal.
 */
export enum PhotoTab {
    FiltersTab = 'filters-tab', // Representa a aba de filtros
    AdjustmentsTab = 'adjustments-tab', // Representa a aba de ajustes
    FormTab = 'form-tab', // Representa a aba de formulário
}

/**
 * Enums para etapas do photo-modal.
 */
export enum PhotoStage {
    CreatePost = 'create-post', // Representa a etapa de criação do post
    EditPostAdjustments = 'edit-post-adjustments', // Representa a etapa de ajustes do post
    EditPostForm = 'edit-post-form', // Representa a etapa de formulário do post
    SharingPost = 'sharing-post', // Representa a etapa de compartilhamento do post
    PostShared = 'post-shared', // Representa a etapa de post compartilhado
    PostFailed = 'post-failed', // Representa a etapa de falha no post
}
