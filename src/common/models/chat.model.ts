import type { User } from "./user.model"

/**
 * Representa uma reação com emoji.
//  */
// export interface Emoji {
//     /** Timestamp da reação com emoji */
//     timeStamp: number

//     /** ID do remetente */
//     senderId: string

//     /** Valor do emoji */
//     emoji: string
// }

/**
 * Representa as reações associadas a um item de chat.
 */
export interface Reactions {
    /** Array de itens curtidos */
    likes: any[]

    /** Número de curtidas */
    likesCount: number

    /** Array of emoji reactions */
    // Emojis: Emoji[]
}

/**
 * Representa um item de chat.
 */
export interface ChatDialog {
    /** ID do item de chat */
    utemId?: string

    /** Uma instância simples do usuário */
    user?: Sender | Viewer

    /** Timestamp do item de chat */
    timestamp?: number

    /** Tipo do item de chat */
    itemType?: string

    /** Indica se o item de chat foi enviado pelo visualizador */
    isSentByViewer?: boolean

    /** ID único de sequência do item de chat */
    uqSeqId?: number

    /** Conteúdo textual do item de chat */
    text?: string

    /** Imagem em formato data URI do item de chat */
    img?: string

    /** Reações associadas ao item de chat */
    reactions?: Reactions
}

/**
 * Representa uma única conversa entre dois usuários.
 */
export interface Conversation {
    /** Identificador único da conversa */
    uuid: string

    /** Usuário que iniciou a conversa */
    user: Sender

    /** Última mensagem da conversa */
    lastMessage: string

    /** Tempo decorrido desde a última mensagem */
    timeSinceLastMessage: string

    /** Diálogos (mensagens) na conversa */
    dialogs: ChatDialog[]

    /** Indica se a conversa está atualmente ativa */
    isActive: boolean
}



/**
 * Representa uma caixa de entrada com threads de chat.
 */
export interface Inbox {
    /** Lista de threads de chat */
    threads: Conversation[]

    /** Número de chats não lidos */
    unseenCount: number

    /** Timestamp da última atualização do contador de não lidos */
    unseenCountTimeStamp: number
}

/**
 * Representa o visualizador (usuário atual) da aplicação.
 */
export interface Viewer extends User {

}

/**
 * Representa o remetente (com quem está conversando) da aplicação.
 */
export interface Sender extends User {

}
