import router from "@/router"
import type { PostCard, PostMedia } from './types/posts'

type LegacyPostMedia = Partial<PostMedia> & {
  type?: PostMedia['type']
  mediaType?: PostMedia['mediaType']
  mediaUrl?: string
  url?: string
  src?: string
  poster?: string
  thumbnailUrl?: string
  title?: string
  index?: number
}

/**
 * Adiciona a propriedade 'index' aos objetos de um array, começando em 0.
 *
 * @param arr Um array de objetos aos quais serão adicionadas propriedades 'index'.
 * @returns O array atualizado com propriedades 'index'.
 */
export function addIndexToObjects<T extends { index: number }>(arr: T[]): T[] {
  let index = 0
  return arr.map(obj => {
    obj.index = index
    index++
    return obj
  })
}

/**
 * Obtém o timestamp Unix atual em milissegundos.
 * @returns {number} O timestamp Unix atual.
 */
export function getCurrentTimestamp(): number {
  return new Date().getTime()
}

/**
 * Gera um inteiro aleatório entre dois números.
 * @param min O número mínimo.
 * @param max O número máximo.
 * @returns Um inteiro aleatório entre os dois números.
 * @see https://stackoverflow.com/a/7228322/1109380
 */
export function randomIntFromInterval(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

/**
 * Navega para a página de perfil do usuário com o nome de usuário informado e um parâmetro de consulta.
 * @param userName - O nome de usuário cujo perfil será aberto.
 */
export function goToUserProfile(userName: string | undefined | null) {
  const cleanedUserName = userName?.toString().trim()
  if (!cleanedUserName || cleanedUserName === 'undefined') {
    router.push({ name: 'profile' })
    return
  }
  router.push({ name: 'profile', params: { username: cleanedUserName } })
}

/**
 * Formata uma string de data para um formato legível.
 * @param date - A string de data a ser formatada.
 * @returns Uma string de data formatada no formato "Mês Dia, Ano".
 */
export function formatDate(date: string) {
  const dateObj = new Date(date)
  const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' } as Intl.DateTimeFormatOptions
  return dateObj.toLocaleDateString('en-US', dateOptions)
}

const inferMediaType = (value?: PostMedia['type'] | PostMedia['mediaType'], fallbackUrl?: string): PostMedia['type'] => {
  if (value === 'video' || value === 'image') {
    return value
  }

  if (fallbackUrl) {
    return /\.(mp4|mov|webm|m3u8)(\?.*)?$/i.test(fallbackUrl) ? 'video' : 'image'
  }

  return 'image'
}

export function normalizePostMediaList(
  medias?: Array<LegacyPostMedia | null | undefined> | null,
  fallbackUrl?: string | null,
  fallbackMediaType?: PostMedia['type'] | PostMedia['mediaType'] | null
): PostMedia[] {
  const normalized = (medias ?? [])
    .filter((media): media is LegacyPostMedia => Boolean(media?.mediaUrl || media?.url || media?.src))
    .map((media, index) => {
      const mediaUrl = media.mediaUrl ?? media.url ?? media.src ?? ''
      const resolvedMediaType = inferMediaType(media.mediaType ?? media.type ?? fallbackMediaType ?? undefined, mediaUrl)
      const item: PostMedia = {
        id: media.id ?? `${mediaUrl}-${index}`,
        mediaUrl,
        type: resolvedMediaType,
        mediaType: resolvedMediaType,
        poster: media.poster ?? media.thumbnailUrl ?? undefined,
        thumbnailUrl: media.thumbnailUrl ?? media.poster ?? undefined,
        width: media.width,
        height: media.height,
        index
      }
      return item
    })

  if (normalized.length > 0) {
    return normalized
  }

  if (!fallbackUrl) {
    return []
  }

  return [{
    id: fallbackUrl,
    mediaUrl: fallbackUrl,
    type: inferMediaType(fallbackMediaType ?? undefined, fallbackUrl),
    mediaType: inferMediaType(fallbackMediaType ?? undefined, fallbackUrl),
    thumbnailUrl: undefined,
    index: 0
  }]
}

export function resolvePostMediaList(post?: Partial<PostCard> | null): PostMedia[] {
  return normalizePostMediaList(
    post?.carouselMedia as Array<LegacyPostMedia | null | undefined> | undefined,
    post?.mediaUrl ?? post?.imageUrl ?? undefined,
    post?.mediaType ?? (post?.imageUrl ? 'image' : undefined)
  )
}

export function resolvePrimaryPostMedia(post?: Partial<PostCard> | null): PostMedia | undefined {
  return resolvePostMediaList(post)[0]
}

export function normalizeGenderValue(value?: string | null) {
  const normalized = value?.trim().toLowerCase()

  switch (normalized) {
    case 'feminino':
    case 'female':
    case 'f':
      return 'Female'
    case 'masculino':
    case 'male':
    case 'm':
      return 'Male'
    default:
      return 'Other'
  }
}
