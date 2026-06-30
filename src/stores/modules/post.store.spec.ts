import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { usePostStore } from './post.store'
import api from '@/services/api'

vi.mock('@/services/api', () => ({
  default: {
    delete: vi.fn(),
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn()
  }
}))

const mockedApi = vi.mocked(api)

describe('post store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('removes a deleted post from both feed and saved lists', async () => {
    const store = usePostStore()
    mockedApi.delete.mockResolvedValue({ data: {} })

    store.posts = [{ id: '1' } as any]
    store.savedPosts = [{ id: '1' } as any]

    await store.deletePost('1')

    expect(store.posts).toHaveLength(0)
    expect(store.savedPosts).toHaveLength(0)
  })
})
