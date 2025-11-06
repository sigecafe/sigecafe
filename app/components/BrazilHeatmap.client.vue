<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface VendasPorEstado {
  estado: string
  totalVendas: number
}

const loading = ref(true)
const vendasData = ref<VendasPorEstado[]>([])
const mapContainer = ref<HTMLElement | null>(null)
const brazilGeoJSON = ref<any>(null)
let map: any = null
let L: any = null

// Detectar tema
const isDark = ref(false)

// Mapeamento de siglas para nomes completos dos estados
const estadosMap: Record<string, string> = {
  'AC': 'Acre', 'AL': 'Alagoas', 'AP': 'Amapá', 'AM': 'Amazonas',
  'BA': 'Bahia', 'CE': 'Ceará', 'DF': 'Distrito Federal', 'ES': 'Espírito Santo',
  'GO': 'Goiás', 'MA': 'Maranhão', 'MT': 'Mato Grosso', 'MS': 'Mato Grosso do Sul',
  'MG': 'Minas Gerais', 'PA': 'Pará', 'PB': 'Paraíba', 'PR': 'Paraná',
  'PE': 'Pernambuco', 'PI': 'Piauí', 'RJ': 'Rio de Janeiro', 'RN': 'Rio Grande do Norte',
  'RS': 'Rio Grande do Sul', 'RO': 'Rondônia', 'RR': 'Roraima', 'SC': 'Santa Catarina',
  'SP': 'São Paulo', 'SE': 'Sergipe', 'TO': 'Tocantins'
}

// Função para mapear nome do estado para sigla
const getStateSigla = (name: string): string => {
  const nameMap: Record<string, string> = {
    'Acre': 'AC', 'Alagoas': 'AL', 'Amapá': 'AP', 'Amazonas': 'AM',
    'Bahia': 'BA', 'Ceará': 'CE', 'Distrito Federal': 'DF', 'Espírito Santo': 'ES',
    'Goiás': 'GO', 'Maranhão': 'MA', 'Mato Grosso': 'MT', 'Mato Grosso do Sul': 'MS',
    'Minas Gerais': 'MG', 'Pará': 'PA', 'Paraíba': 'PB', 'Paraná': 'PR',
    'Pernambuco': 'PE', 'Piauí': 'PI', 'Rio de Janeiro': 'RJ', 'Rio Grande do Norte': 'RN',
    'Rio Grande do Sul': 'RS', 'Rondônia': 'RO', 'Roraima': 'RR', 'Santa Catarina': 'SC',
    'São Paulo': 'SP', 'Sergipe': 'SE', 'Tocantins': 'TO'
  }
  return nameMap[name] || name
}

// Formatar valor como moeda
const formatarParaMoeda = (valor: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2
  }).format(valor)
}

// Calcular cor baseada no valor
const getColor = (sigla: string) => {
  const venda = vendasData.value.find(v => v.estado === sigla)
  if (!venda || vendasData.value.length === 0) return isDark.value ? '#1f2937' : '#e5e7eb'
  
  const maxVendas = Math.max(...vendasData.value.map(v => v.totalVendas))
  const minVendas = Math.min(...vendasData.value.map(v => v.totalVendas))
  
  // Normalizar entre 0 e 1
  const intensity = maxVendas === minVendas 
    ? 0.5 
    : (venda.totalVendas - minVendas) / (maxVendas - minVendas)
  
  // Escala de verde MUITO vibrante e visível
  if (isDark.value) {
    // Tema escuro: cores super vibrantes
    if (intensity < 0.2) return '#fde047' // amarelo brilhante
    if (intensity < 0.4) return '#a3e635' // verde-amarelo vibrante
    if (intensity < 0.6) return '#22c55e' // verde vibrante
    if (intensity < 0.8) return '#16a34a' // verde forte
    return '#166534' // verde muito escuro
  } else {
    // Tema claro: cores ainda mais saturadas
    if (intensity < 0.2) return '#fde047' // amarelo brilhante
    if (intensity < 0.4) return '#84cc16' // verde-amarelo forte
    if (intensity < 0.6) return '#22c55e' // verde vibrante
    if (intensity < 0.8) return '#15803d' // verde forte
    return '#14532d' // verde muito escuro
  }
}

// Estilo para cada feature
const style = (feature: any) => {
  const sigla = getStateSigla(feature.properties.name || feature.properties.sigla)
  return {
    fillColor: getColor(sigla),
    weight: 1.5,
    opacity: 1,
    color: isDark.value ? '#111827' : '#374151',
    fillOpacity: 1
  }
}

// Eventos de hover
const highlightFeature = (e: any) => {
  const layer = e.target
  layer.setStyle({
    weight: 2,
    color: isDark.value ? '#60a5fa' : '#3b82f6',
    fillOpacity: 0.9
  })
  layer.bringToFront()
}

const resetHighlight = (e: any) => {
  const layer = e.target
  const feature = layer.feature
  if (feature) {
    layer.setStyle(style(feature))
  }
}

// Criar popup
const onEachFeature = (feature: any, layer: any) => {
  const nome = feature.properties.name || feature.properties.nome
  const sigla = getStateSigla(nome)
  const venda = vendasData.value.find(v => v.estado === sigla)
  
  const popupContent = venda 
    ? `<div class="text-sm">
         <div class="font-semibold">${nome}</div>
         <div>${formatarParaMoeda(venda.totalVendas)}</div>
       </div>`
    : `<div class="text-sm">
         <div class="font-semibold">${nome}</div>
         <div>Sem dados</div>
       </div>`
  
  layer.bindPopup(popupContent)
  
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: (e: any) => {
      layer.openPopup()
    }
  })
}

// Inicializar mapa
const initMap = () => {
  if (!mapContainer.value || map || !L || !brazilGeoJSON.value) return
  
  try {
    // Criar mapa
    map = L.map(mapContainer.value, {
      zoomControl: true,
      scrollWheelZoom: false,
      dragging: true,
      attributionControl: false
    }).setView([-14.235, -51.925], 4)
    
    // Adicionar camada GeoJSON (sem tile layer de fundo)
    const geoJsonLayer = L.geoJSON(brazilGeoJSON.value, {
      style: style,
      onEachFeature: onEachFeature
    }).addTo(map)
    
    // Ajustar bounds
    map.fitBounds(geoJsonLayer.getBounds(), { padding: [20, 20] })
  } catch (e) {
    console.error('Erro ao criar mapa:', e)
  }
}

// Atualizar cores quando tema muda
const updateMapColors = () => {
  if (!map || !L) return
  
  map.eachLayer((layer: any) => {
    if (layer.eachLayer) {
      layer.eachLayer((subLayer: any) => {
        if (subLayer.feature) {
          const newStyle = style(subLayer.feature)
          subLayer.setStyle(newStyle)
        }
      })
    }
  })
}

onMounted(async () => {
  try {
    // Importar Leaflet apenas no client-side
    if (typeof window !== 'undefined') {
      L = (await import('leaflet')).default
      await import('leaflet/dist/leaflet.css')
    }
    
    // Detectar tema inicial
    isDark.value = document.documentElement.classList.contains('dark')
    
    // Observer para mudanças de tema
    const observer = new MutationObserver(() => {
      isDark.value = document.documentElement.classList.contains('dark')
      updateMapColors()
    })
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })

    // Carregar GeoJSON do Brasil
    const geoData = await $fetch('/brazil-states.json')
    brazilGeoJSON.value = geoData

    // Carregar dados de vendas
    const data = await $fetch<VendasPorEstado[]>('/api/metrics/sales-by-state')
    if (data && Array.isArray(data)) {
      vendasData.value = data
    }
    
    loading.value = false
    
    // Aguardar próximo tick para garantir que o container está montado e L está disponível
    await new Promise(resolve => setTimeout(resolve, 200))
    
    if (L && mapContainer.value && brazilGeoJSON.value) {
      initMap()
    }
  } catch (error) {
    console.error('Erro ao carregar mapa:', error)
    loading.value = false
  }
})
</script>

<template>
  <div class="w-full relative">
    <div v-if="loading" class="text-gray-500 dark:text-gray-400 text-center py-8">
      Carregando mapa de vendas...
    </div>
    <div v-else class="w-full flex flex-col">
      <!-- Container do mapa Leaflet -->
      <div ref="mapContainer" class="w-full rounded-lg" 
           style="height: 400px;"
           :class="isDark ? 'bg-gray-800' : 'bg-gray-50'"></div>
      
      <!-- Legenda -->
      <div class="mt-4 flex items-center justify-center gap-4 text-sm">
        <span :class="isDark ? 'text-gray-300' : 'text-gray-700'">Menos vendas</span>
        <div class="flex gap-1">
          <div class="w-10 h-5 rounded border" :class="isDark ? 'border-gray-600' : 'border-gray-300'" style="background-color: #fde047"></div>
          <div class="w-10 h-5 rounded border" :class="isDark ? 'border-gray-600' : 'border-gray-300'" style="background-color: #84cc16"></div>
          <div class="w-10 h-5 rounded border" :class="isDark ? 'border-gray-600' : 'border-gray-300'" style="background-color: #22c55e"></div>
          <div class="w-10 h-5 rounded border" :class="isDark ? 'border-gray-600' : 'border-gray-300'" style="background-color: #15803d"></div>
          <div class="w-10 h-5 rounded border" :class="isDark ? 'border-gray-600' : 'border-gray-300'" style="background-color: #14532d"></div>
        </div>
        <span :class="isDark ? 'text-gray-300' : 'text-gray-700'">Mais vendas</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Estilos do Leaflet customizados para o tema */
:deep(.leaflet-popup-content-wrapper) {
  background: v-bind('isDark ? "#1f2937" : "#ffffff"');
  color: v-bind('isDark ? "#ffffff" : "#000000"');
}

:deep(.leaflet-popup-tip) {
  background: v-bind('isDark ? "#1f2937" : "#ffffff"');
}
</style>
