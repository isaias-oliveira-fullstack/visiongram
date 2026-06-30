import type { PostCard } from "../types"

/**
 * Interface base do modelo de usuário
 */
export interface BaseUser {
  /** ID no banco de dados */
  id: string

  /** Primeiro nome do usuário */
  firstName: string

  /** Sobrenome do usuário */
  lastName: string

  /** Nome de usuário do usuário */
  userName: string

  /** Gênero do usuário */
  gender: 'Female' | 'Male' | 'Other'

  /** URL da foto de perfil do usuário */
  profilePictureUrl: string

  /** E-mail do usuário */
  email?: string

  /** Número de posts no perfil do usuário */
  mediaCount?: number
  
  /** Número de seguidores do usuário */
  followerCount: number

  /** Número de usuários que o usuário segue */
  followingCount: number

  /** Relação com outros usuários */
  friendShip?: FriendShipStatus

  followers?: BaseUser[]

  following?: BaseUser[]
}

/**
 * Interface do modelo de usuário
 */
export interface User extends BaseUser {

    /** O usuário está ativo? */
    isActive?: boolean
  
    /** Se a conta do usuário é privada ou não */
    isPrivate?: boolean
  
    /** Se a conta do usuário é verificada ou não */
    isVerified?: boolean
  
    /** O usuário é superusuário? */
    isSuperuser?: boolean
  
    /** Data e hora do último login */
    lastLogin?: string
  
    /** Data e hora de cadastro */
    dateJoined: string
  
    /** Data e hora da última modificação do cadastro */
    lastModifiedAt?: string
  
    /** Biografia do usuário */
    biography?: string
  
    /** Posts feitos pelo usuário */
    mediaItems: PostCard[]
  }
  

/**
 * Interface para o status de amizade entre usuários.
 */
export interface FriendShipStatus {
  /**
   * Indica se o usuário está silenciando o outro usuário.
   */
  muting?: boolean

  /**
   * Indica se o usuário está silenciando o reel do outro usuário.
   */
  isMutingReel?: boolean

  /**
   * Indica se o usuário está seguindo o outro usuário.
   */
  following?: boolean

  /**
   * Indica se o usuário enviou uma solicitação de amizade para o outro usuário.
   */
  outgoingRequest?: boolean
}