import { defineStore } from 'pinia'
import type { OfferDTO, CreateOfferDTO, OfferBookDTO } from '~/types/api'

interface OfferState {
  bids: OfferDTO[];
  asks: OfferDTO[];
  loading: boolean;
  error: string | null;
}

export const useOfferStore = defineStore('offer', {
  state: (): OfferState => ({
    bids: [],
    asks: [],
    loading: false,
    error: null
  }),
  actions: {
    async fetchOffers() {
      this.loading = true
      this.error = null
      try {
        // Fetch all offers in a single request
        const res = await $fetch<{ success: boolean; data: OfferBookDTO }>('/api/offers', {
          credentials: 'include'
        })

        if (!res.success) throw new Error('Failed to load offers')
        this.bids = res.data.bids
        this.asks = res.data.asks
      } catch (err: any) {
        this.error = err.message || 'Error fetching offers'
      } finally {
        this.loading = false
      }
    },

    async fetchBids() {
      this.loading = true
      this.error = null
      try {
        const res = await $fetch<{ success: boolean; data: OfferDTO[] }>('/api/offers', {
          query: { type: 'bids' },
          credentials: 'include'
        })

        if (!res.success) throw new Error('Failed to load buy offers')
        this.bids = res.data
        return res.data
      } catch (err: any) {
        this.error = err.message || 'Error fetching buy offers'
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchAsks() {
      this.loading = true
      this.error = null
      try {
        const res = await $fetch<{ success: boolean; data: OfferDTO[] }>('/api/offers', {
          query: { type: 'asks' },
          credentials: 'include'
        })

        if (!res.success) throw new Error('Failed to load sell offers')
        this.asks = res.data
        return res.data
      } catch (err: any) {
        this.error = err.message || 'Error fetching sell offers'
        throw err
      } finally {
        this.loading = false
      }
    },

    async createOffer(payload: CreateOfferDTO) {
      this.loading = true
      this.error = null
      try {
        const res = await $fetch<{ success: boolean; data: OfferDTO; message?: string }>('/api/offers', {
          method: 'POST',
          body: payload,
          credentials: 'include'
        })

        if (!res.success) {
          throw new Error(res.message || 'Falha ao criar oferta')
        }

        // Refresh offers list
        await this.fetchOffers()
        return res.data
      } catch (err: any) {
        console.error('Erro criando oferta:', err)
        // Handle different types of errors
        if (err.response && err.response.status === 403) {
          this.error = 'Não autorizado a criar este tipo de oferta'
        } else if (err.response && err.response.status === 400) {
          this.error = 'Dados da oferta inválidos'
        } else {
          this.error = err.message || 'Erro ao criar oferta. Tente novamente.'
        }
        throw err
      } finally {
        this.loading = false
      }
    },

    async cancelOffer(offerId: number) {
      this.loading = true
      this.error = null
      try {
        const res = await $fetch<{ success: boolean }>(`/api/offers/${offerId}`, {
          method: 'DELETE',
          credentials: 'include'
        })
        if (!res.success) throw new Error('Failed to cancel offer')

        // Refresh offers list
        await this.fetchOffers()
      } catch (err: any) {
        this.error = err.message || 'Error canceling offer'
      } finally {
        this.loading = false
      }
    }
  }
})