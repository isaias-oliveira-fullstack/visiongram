/**
 * Representa o formulário de login.
 */
export interface LoginInput {
  /** Nome de usuário ou e-mail do usuário */
  username: string | null

  /** Senha do usuário */
  password: string | null
}

/**
 * Representa o formulário de cadastro.
 */
export interface RegisterInput {
  /** Endereço de e-mail do usuário */
  email: string | null

  /** Primeiro nome do usuário */
  firstName: string | null

  /** Sobrenome do usuário */
  lastName: string | null

  /** Nome de usuário desejado */
  username: string | null

  /** Senha desejada */
  password: string | null

  /** URL opcional do avatar do usuário */
  avatar?: string | null

  /** Biografia opcional do usuário */
  bio?: string | null
}