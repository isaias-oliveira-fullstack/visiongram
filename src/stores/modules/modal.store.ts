import {
  defineStore
} from 'pinia'

import {
  ModalName,
} from '@/common'

/**
 * Modal do Store
 */
export const useModalManagerStore = defineStore('modal', {
    state: () => ({
      modalName: null as string | null, // Armazena o nome do modal aberto ou nulo se nenhum modal estiver aberto
      post: null as any,
    }),
    getters: {
      isAnyModalOpen: (state) => !!state.modalName,
      shouldBlur: (state) => (state.modalName != ModalName.FOLLOW),
      getOpenModal: (state) => state.modalName,
      getActivePost: (state) => state.post,
    },
    actions: {
      openModal(modalName: string) {
        this.modalName = modalName
      },
      closeModal() {
        this.modalName = null
      },
      setActivePost(post: any) {
        this.post = post
      },
      clearActivePost() {
        this.post = null
      },
      toggleModal(modalName: string ) {
        if (this.modalName === modalName) {
          this.modalName = null // Fecha o modal atualmente aberto
        } else {
          this.modalName = modalName // Abre o modal especificado
        }
      },
    },
  })
  