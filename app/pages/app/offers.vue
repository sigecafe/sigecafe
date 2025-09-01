<template>
  <div class="container mx-auto p-6 space-y-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-semibold">Livro de Ofertas</h1>
    </div>

    <!-- Offer form -->
    <Card v-if="!isAdminOrStaff && showOfferForm" class="p-4 mb-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-medium">
          {{ side === 'BUY' ? 'Nova Oferta de Compra' : 'Nova Oferta de Venda' }}
        </h3>
        <button
          @click="showOfferForm = false"
          class="text-gray-500 hover:text-gray-700"
        >
          <span class="font-bold text-xl">×</span>
        </button>
      </div>
      <div class="flex flex-col md:flex-row md:items-end gap-4">
        <div class="w-full md:w-1/3">
          <label class="block text-sm font-medium mb-1">Preço</label>
          <Input
            v-model="price"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="R$"
            :class="{'border-red-300 focus:border-red-500': priceError}"
          />
          <p v-if="priceError" class="text-xs text-red-500 mt-1">
            {{ priceError }}
          </p>
        </div>
        <div class="w-full md:w-1/3">
          <label class="block text-sm font-medium mb-1">Quantidade (sacas)</label>
          <Input
            v-model="quantity"
            type="number"
            step="1"
            min="1"
            placeholder="0"
            :class="{'border-red-300 focus:border-red-500': quantityError}"
          />
          <p v-if="quantityError" class="text-xs text-red-500 mt-1">
            {{ quantityError }}
          </p>
        </div>
        <div class="w-full md:w-1/3 mt-4 md:mt-0">
          <Button
            @click="submit"
            variant="default"
            class="w-full"
            :disabled="isSubmitting || offerStore.loading"
          >
            {{ isSubmitting ? 'Enviando...' : 'Enviar Oferta' }}
          </Button>
        </div>
      </div>
    </Card>

    <!-- Error message -->
    <div v-if="offerStore.error" class="bg-red-50 border border-red-200 text-red-600 p-3 rounded">
      {{ offerStore.error }}
    </div>

    <!-- Side by side offer tables -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Buy offers table (Compradores) -->
      <Card class="p-4">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold text-green-700">Ofertas de Compra</h2>
          <Button
            v-if="!isAdminOrStaff"
            variant="outline"
            size="sm"
            @click="openNewBuyOffer"
            :disabled="!canPlaceBuyOffer"
          >
            Novo
          </Button>
        </div>
        <GenericDatatable
          model="offers"
          :endpoint="`/api/offers?type=bids`"
          :columns="bidColumns"
          :options="{ paging: false, searching: false, ordering: true }"
        >
          <template #custom-price="{ cellData }">
            <span class="text-green-600 font-medium">R$ {{ parseFloat(cellData).toFixed(2) }}</span>
          </template>
          <template #actions="{ cellData }">
            <button
              v-if="isCurrentUserOffer(cellData) || isAdminOrStaff"
              @click="cancelOffer(cellData)"
              class="text-gray-500 hover:text-red-600 transition-colors focus:outline-none"
              title="Cancelar oferta"
            >
              <span class="font-bold">×</span>
            </button>
          </template>
        </GenericDatatable>
      </Card>

      <!-- Sell offers table (Produtores) -->
      <Card class="p-4">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold text-red-700">Ofertas de Venda</h2>
          <Button
            v-if="!isAdminOrStaff"
            variant="outline"
            size="sm"
            @click="openNewSellOffer"
            :disabled="!canPlaceSellOffer"
          >
            Novo
          </Button>
        </div>
        <GenericDatatable
          model="offers"
          :endpoint="`/api/offers?type=asks`"
          :columns="askColumns"
          :options="{ paging: false, searching: false, ordering: true }"
        >
          <template #custom-price="{ cellData }">
            <span class="text-red-600 font-medium">R$ {{ parseFloat(cellData).toFixed(2) }}</span>
          </template>
          <template #actions="{ cellData }">
            <button
              v-if="isCurrentUserOffer(cellData) || isAdminOrStaff"
              @click="cancelOffer(cellData)"
              class="text-gray-500 hover:text-red-600 transition-colors focus:outline-none"
              title="Cancelar oferta"
            >
              <span class="font-bold">×</span>
            </button>
          </template>
        </GenericDatatable>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useOfferStore } from '~/stores/OfferStore'
import { useUsuarioStore } from '~/stores/UserStore'
import type { OfferDTO } from '~/types/api'
import Input from '~/components/Ui/Input.vue'
import Button from '~/components/Ui/Button.vue'
import Card from '~/components/Ui/Card/Card.vue'
import Select from '~/components/Ui/Select/Select.vue'
import GenericDatatable from '~/components/Ui/GenericDatatable/GenericDatatable.vue'

const offerStore = useOfferStore()
const usuarioStore = useUsuarioStore()
const side = ref<'BUY' | 'SELL'>('BUY')
const price = ref<string>('')
const quantity = ref<string>('')
const priceError = ref<string>('')
const quantityError = ref<string>('')
const canChooseSide = ref(true)
const isSubmitting = ref(false)
const showOfferForm = ref(false)

// Check if user is admin or staff
const isAdminOrStaff = computed(() => {
  const userType = usuarioStore.usuarioPreferences?.type
  return userType === 'ADMINISTRADOR' || userType === 'COOPERATIVA' || userType === 'COLABORADOR'
})

// Check if user can place buy offers
const canPlaceBuyOffer = computed(() => {
  const userType = usuarioStore.usuarioPreferences?.type
  return userType === 'COMPRADOR' || userType === 'ADMINISTRADOR' ||
         userType === 'COOPERATIVA' || userType === 'COLABORADOR'
})

// Check if user can place sell offers
const canPlaceSellOffer = computed(() => {
  const userType = usuarioStore.usuarioPreferences?.type
  return userType === 'PRODUTOR' || userType === 'ADMINISTRADOR' ||
         userType === 'COOPERATIVA' || userType === 'COLABORADOR'
})

// Open form for a new buy offer
function openNewBuyOffer() {
  side.value = 'BUY'
  price.value = ''
  quantity.value = ''
  showOfferForm.value = true
}

// Open form for a new sell offer
function openNewSellOffer() {
  side.value = 'SELL'
  price.value = ''
  quantity.value = ''
  showOfferForm.value = true
}

// Column definitions for buy offers table
const bidColumns = computed(() => [
  {
    label: 'Preço',
    field: 'price',
    type: 'money',
    sortable: true,
    render: '#custom-price'
  },
  {
    label: 'Qtd.',
    field: 'quantity',
    type: 'integer',
    sortable: true
  },
  {
    label: "Comprador",
    field: "usuario.name",
    type: "relation",
    relationEndpoint: "/api/comprador",
    relationLabel: "name",
    relationValue: "id"
  }
])

// Column definitions for sell offers table
const askColumns = computed(() => [
  {
    label: 'Preço',
    field: 'price',
    type: 'money',
    sortable: true,
    render: '#custom-price'
  },
  {
    label: 'Qtd.',
    field: 'quantity',
    type: 'integer',
    sortable: true
  },
  {
    label: "Produtor",
    field: "usuario.name",
    type: "relation",
    relationEndpoint: "/api/produtor",
    relationLabel: "name",
    relationValue: "id"
  }
])

// Format date for display
function formatDate(input: Date | string) {
  const date = new Date(input)
  return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

// Check if an offer belongs to the current user
function isCurrentUserOffer(offer: OfferDTO): boolean {
  if (!usuarioStore.usuarioPreferences) return false
  return offer.user === usuarioStore.usuarioPreferences.name
}

// Cancel an offer
async function cancelOffer(offer: OfferDTO) {
  try {
    await offerStore.cancelOffer(offer.id)
  } catch (error) {
    console.error('Erro ao cancelar oferta:', error)
  }
}

async function submit() {
  // Reset error messages
  priceError.value = ''
  quantityError.value = ''
  offerStore.error = null

  // Validate price
  const p = parseFloat(price.value)
  if (!p || p <= 0) {
    priceError.value = 'Informe um preço válido'
    return
  }

  // Validate quantity
  const q = parseInt(quantity.value)
  if (!q || q <= 0) {
    quantityError.value = 'Informe uma quantidade válida'
    return
  }

  try {
    isSubmitting.value = true

    // Ensure side is explicitly set based on user type if not already set
    if (!side.value) {
      const userType = usuarioStore.usuarioPreferences?.type
      if (userType === 'PRODUTOR') {
        side.value = 'SELL'
      } else if (userType === 'COMPRADOR') {
        side.value = 'BUY'
      }
    }

    // Create payload with side included
    const payload = {
      price: p,
      quantity: q,
      side: side.value
    }

    console.log('Submitting offer with payload:', payload)

    // Use the store method which calls the unified endpoint
    await offerStore.createOffer(payload)

    // Reset form on success
    price.value = ''
    quantity.value = ''
    showOfferForm.value = false
  } catch (error: any) {
    console.error('Erro ao criar oferta:', error)
  } finally {
    isSubmitting.value = false
  }
}

// Watch for changes in the offer store data
watch(() => [offerStore.bids, offerStore.asks], () => {
  // This will trigger reactivity updates for the GenericDatatables
}, { deep: true })

// Fetch user role and order book on mount
onMounted(async () => {
  await usuarioStore.fetchUsuarioPreferences()

  // Default to allowing both sides
  canChooseSide.value = true

  // Set side based on user type directly from preferences
  const userType = usuarioStore.usuarioPreferences?.type
  if (userType) {
    if (userType === 'PRODUTOR') {
      // Produtores can only SELL
      side.value = 'SELL'
      canChooseSide.value = false
    } else if (userType === 'COMPRADOR') {
      // Compradores can only BUY
      side.value = 'BUY'
      canChooseSide.value = false
    }
  }

  // Fetch offers
  await offerStore.fetchOffers()
})
</script>