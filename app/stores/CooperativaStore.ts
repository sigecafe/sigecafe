import { defineStore } from 'pinia'
import type { CooperativaDTO } from '~/types/api'

interface CooperativaState {
  cooperativa: CooperativaDTO | null
}

export const useCooperativaStore = defineStore('Cooperativa', {
  state: (): CooperativaState => ({
    cooperativa: null
  }),
  actions: {
    async fetchCooperativa() {
      try {
        const data = await $fetch<CooperativaDTO>('/api/cooperativa', {
          credentials: 'include'
        })

        this.cooperativa = data || null
      } catch (error) {
        console.error('Error fetching cooperativa:', error)
        this.cooperativa = null
      }
    },
    async updateCooperativa(cooperativa: CooperativaDTO) {
      try {
        await $fetch<CooperativaDTO>('/api/cooperativa', {
          method: 'PUT',
          body: cooperativa,
          credentials: 'include'
        })

        // Update local state after successful API call
        this.cooperativa = cooperativa
      } catch (error) {
        console.error('Error updating cooperativa:', error)
        throw error
      }
    }
  }
})