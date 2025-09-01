<template>
  <div>
    <AppPage>
      <UiCard class="mt-10 mb-6">
        <UiCardHeader>
          <UiCardTitle>Relatórios</UiCardTitle>
          <UiCardDescription>
            Gere relatórios personalizados de transações e produtores.
          </UiCardDescription>
        </UiCardHeader>
        <UiCardContent>
          <!-- Report filters -->
          <div class="mb-6 rounded-lg border p-4">
            <h3 class="text-lg font-medium mb-4">Filtros do Relatório</h3>

            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div class="space-y-2">
                <label class="text-sm font-medium">Tipo de Relatório</label>
                <UiSelect v-model="reportType">
                  <UiSelectTrigger class="w-full">
                    <UiSelectValue placeholder="Selecione o tipo de relatório" />
                  </UiSelectTrigger>
                  <UiSelectContent class="z-[200]">
                    <UiSelectGroup>
                      <UiSelectItem value="transactions">Transações</UiSelectItem>
                      <UiSelectItem value="producers">Produtores</UiSelectItem>
                      <UiSelectItem value="buyers">Compradores</UiSelectItem>
                    </UiSelectGroup>
                  </UiSelectContent>
                </UiSelect>
              </div>

              <div class="space-y-2">
                <label class="text-sm font-medium">Data Inicial</label>
                <input type="date" v-model="filters.startDate"
                  class="h-10 w-full rounded-md border border-input bg-background px-3 py-2">
              </div>

              <div class="space-y-2">
                <label class="text-sm font-medium">Data Final</label>
                <input type="date" v-model="filters.endDate"
                  class="h-10 w-full rounded-md border border-input bg-background px-3 py-2">
              </div>

              <div v-if="reportType === 'transactions'" class="space-y-2">
                <label class="text-sm font-medium">Status</label>
                <UiSelect v-model="filters.status">
                  <UiSelectTrigger class="w-full">
                    <UiSelectValue placeholder="Selecione o status" />
                  </UiSelectTrigger>
                  <UiSelectContent class="z-[200]">
                    <UiSelectGroup>
                      <UiSelectItem value="TODOS">Todos</UiSelectItem>
                      <UiSelectItem value="PENDENTE">Pendente</UiSelectItem>
                      <UiSelectItem value="CONCLUIDA">Concluída</UiSelectItem>
                      <UiSelectItem value="CANCELADA">Cancelada</UiSelectItem>
                    </UiSelectGroup>
                  </UiSelectContent>
                </UiSelect>
              </div>

              <div v-if="reportType === 'transactions'" class="space-y-2">
                <label class="text-sm font-medium">Valor Mínimo</label>
                <input type="number" v-model="filters.minValue" placeholder="R$ 0,00"
                  class="h-10 w-full rounded-md border border-input bg-background px-3 py-2">
              </div>

              <div v-if="reportType === 'transactions'" class="space-y-2">
                <label class="text-sm font-medium">Valor Máximo</label>
                <input type="number" v-model="filters.maxValue" placeholder="R$ 0,00"
                  class="h-10 w-full rounded-md border border-input bg-background px-3 py-2">
              </div>

              <div v-if="reportType !== 'transactions'" class="space-y-2">
                <label class="text-sm font-medium">Cidade</label>
                <input type="text" v-model="filters.city" placeholder="São Paulo"
                  class="h-10 w-full rounded-md border border-input bg-background px-3 py-2">
              </div>

              <div v-if="reportType !== 'transactions'" class="space-y-2">
                <label class="text-sm font-medium">Estado</label>
                <input type="text" v-model="filters.state" placeholder="SP"
                  class="h-10 w-full rounded-md border border-input bg-background px-3 py-2">
              </div>
            </div>

            <div class="mt-4 flex justify-end">
              <UiButton @click="generateReport" :disabled="loading">
                <Icon v-if="loading" name="lucide:loader-2" class="mr-2 h-4 w-4 animate-spin" />
                Gerar Relatório
              </UiButton>
            </div>
          </div>

          <!-- Loading state -->
          <div v-if="loading" class="flex justify-center py-8">
            <div class="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>

          <!-- Report results -->
          <div v-else-if="reportData.length > 0">
            <div class="flex justify-between mb-4">
              <h3 class="text-lg font-medium">Resultados</h3>
              <div class="flex gap-2">
                <UiButton variant="outline" size="sm" @click="exportPDF" :disabled="exportLoading">
                  <Icon v-if="exportLoading" name="lucide:loader-2" class="mr-2 h-4 w-4 animate-spin" />
                  <Icon v-else name="lucide:file-type-pdf" class="mr-2 h-4 w-4" />
                  Exportar PDF
                </UiButton>
                <UiButton variant="outline" size="sm" @click="exportCSV">
                  <Icon name="lucide:file-type-csv" class="mr-2 h-4 w-4" />
                  Exportar CSV
                </UiButton>
              </div>
            </div>

            <!-- Transaction report -->
            <div v-if="reportType === 'transactions'" class="rounded-md border dark:border-gray-700">
              <div class="overflow-x-auto w-full">
                <table
                  class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-black text-gray-900 dark:text-white">
                  <thead class="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Data
                      </th>
                      <th
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Comprador
                      </th>
                      <th
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Produtor
                      </th>
                      <th
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Quantidade
                      </th>
                      <th
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Valor Total
                      </th>
                      <th
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white dark:bg-black divide-y divide-gray-200 dark:divide-gray-700">
                    <tr v-for="(item, index) in reportData" :key="item?.id || index">
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {{ formatDate(item?.data) }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {{ item?.comprador }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {{ item?.produtor }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {{ item?.quantidade }} sacas
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        R$ {{ (item?.quantidade * item?.precoUnitario).toFixed(2) }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" :class="{
                          'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': item?.status === 'CONCLUIDA',
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200': item?.status === 'PENDENTE',
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200': item?.status === 'CANCELADA'
                        }">
                          {{ item?.status }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Associados report -->
            <div v-else class="rounded-md border dark:border-gray-700">
              <div class="overflow-x-auto w-full">
                <table
                  class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-black text-gray-900 dark:text-white">
                  <thead class="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Nome
                      </th>
                      <th
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Contato
                      </th>
                      <th
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Documento
                      </th>
                      <th
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Localização
                      </th>
                      <th
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Transações
                      </th>
                      <th
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Volume Total
                      </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white dark:bg-black divide-y divide-gray-200 dark:divide-gray-700">
                    <tr v-for="(item, index) in reportData" :key="item?.id || index">
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {{ item?.nome }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {{ item?.celular || '-' }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {{ item?.documento || '-' }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {{ item?.cidade ? `${item.cidade}, ${item.estado || ''}` : '-' }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {{ item?.transacoes || 0 }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {{ item?.volume ? `${item.volume} sacas` : '-' }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Report summary -->
            <div class="mt-6 rounded-lg border p-4">
              <h3 class="text-lg font-medium mb-4">Resumo</h3>

              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div v-if="reportType === 'transactions'" class="space-y-1">
                  <p class="text-sm text-muted-foreground">Total de Transações</p>
                  <p class="text-2xl font-bold">{{ reportData.length }}</p>
                </div>
                <div v-if="reportType === 'transactions'" class="space-y-1">
                  <p class="text-sm text-muted-foreground">Volume Total</p>
                  <p class="text-2xl font-bold">{{ calculateTotalVolume() }} sacas</p>
                </div>
                <div v-if="reportType === 'transactions'" class="space-y-1">
                  <p class="text-sm text-muted-foreground">Valor Total</p>
                  <p class="text-2xl font-bold">R$ {{ calculateTotalValue().toFixed(2) }}</p>
                </div>
                <div v-if="reportType === 'transactions'" class="space-y-1">
                  <p class="text-sm text-muted-foreground">Média por Transação</p>
                  <p class="text-2xl font-bold">R$ {{ calculateAverageValue().toFixed(2) }}</p>
                </div>

                <div v-if="reportType !== 'transactions'" class="space-y-1">
                  <p class="text-sm text-muted-foreground">Total de {{ reportType === 'producers' ? 'Produtores' :
                    'Compradores' }}</p>
                  <p class="text-2xl font-bold">{{ reportData.length }}</p>
                </div>
                <div v-if="reportType !== 'transactions'" class="space-y-1">
                  <p class="text-sm text-muted-foreground">Volume Total</p>
                  <p class="text-2xl font-bold">{{ calculateTotalAssociadoVolume() }} sacas</p>
                </div>
                <div v-if="reportType !== 'transactions'" class="space-y-1">
                  <p class="text-sm text-muted-foreground">Média de Transações</p>
                  <p class="text-2xl font-bold">{{ calculateAverageTransactions() }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- No results message -->
          <div v-else-if="hasSearched" class="text-center py-8">
            <Icon name="lucide:file-search" class="mx-auto h-12 w-12 text-muted-foreground" />
            <p class="mt-4 text-lg font-medium">Nenhum resultado encontrado</p>
            <p class="text-sm text-muted-foreground">Tente ajustar os filtros para encontrar o que procura.</p>
          </div>
        </UiCardContent>
      </UiCard>
    </AppPage>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import type { TransacaoDTO, AssociadoDTO } from '~/types/api';
import UiSelect from '@/components/Ui/Select/Select.vue';
import UiSelectContent from '@/components/Ui/Select/Content.vue';
import UiSelectGroup from '@/components/Ui/Select/Group.vue';
import UiSelectItem from '@/components/Ui/Select/Item.vue';
import UiSelectTrigger from '@/components/Ui/Select/Trigger.vue';
import UiSelectValue from '@/components/Ui/Select/Value.vue';

// Report type
const reportType = ref('transactions');

// Filters
const filters = reactive({
  startDate: '',
  endDate: '',
  status: 'TODOS',
  minValue: '',
  maxValue: '',
  city: '',
  state: ''
});

// State
const loading = ref(false);
const exportLoading = ref(false);
const reportData = ref<any[]>([]);
const hasSearched = ref(false);

// Format date for display
function formatDate(date: string | Date) {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('pt-BR');
}

// Generate report
async function generateReport() {
  loading.value = true;
  hasSearched.value = true;

  try {
    if (reportType.value === 'transactions') {
      await fetchTransactionsReport();
    } else if (reportType.value === 'producers') {
      await fetchAssociadosReport('PRODUTOR');
    } else if (reportType.value === 'buyers') {
      await fetchAssociadosReport('COMPRADOR');
    }
  } catch (error) {
    console.error('Error generating report:', error);
    reportData.value = [];
  } finally {
    loading.value = false;
  }
}

// Fetch transactions report
async function fetchTransactionsReport() {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams();

    if (filters.startDate) {
      queryParams.append('dataInicio', new Date(filters.startDate).toISOString());
    }

    if (filters.endDate) {
      queryParams.append('dataFim', new Date(filters.endDate).toISOString());
    }

    if (filters.status && filters.status !== 'TODOS') {
      queryParams.append('status', filters.status);
    }

    // Fazer a requisição com credentials
    const response = await fetch(`/api/transacoes?${queryParams.toString()}`, {
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar transações');
    }

    const data = await response.json();

    // Filtrar os dados
    let filteredData = Array.isArray(data) ? data : (Array.isArray(data.data) ? data.data : []);

    if (filters.minValue) {
      filteredData = filteredData.filter((item: TransacaoDTO) =>
        (item.quantidade * item.precoUnitario) >= parseFloat(filters.minValue)
      );
    }

    if (filters.maxValue) {
      filteredData = filteredData.filter((item: TransacaoDTO) =>
        (item.quantidade * item.precoUnitario) <= parseFloat(filters.maxValue)
      );
    }

    // Set report data
    reportData.value = filteredData;
  } catch (error) {
    console.error('Error fetching transactions report:', error);
    throw error;
  }
}

// Fetch associados report (producers or buyers)
async function fetchAssociadosReport(tipo: 'PRODUTOR' | 'COMPRADOR') {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams();
    queryParams.append('tipo', tipo);

    if (filters.city) {
      queryParams.append('cidade', filters.city);
    }

    if (filters.state) {
      queryParams.append('estado', filters.state);
    }

    const response = await $fetch<any>(`/api/associado?${queryParams.toString()}`);

    // Enhance with transaction data (in a real app, we would have a dedicated API for this)
    const data = (response.data || []).map((item: AssociadoDTO) => ({
      ...item,
      transacoes: Math.floor(Math.random() * 20), // Mock transaction count
      volume: Math.floor(Math.random() * 100) * 10 // Mock volume
    }));

    reportData.value = data;
  } catch (error) {
    console.error('Error fetching associados report:', error);
    throw error;
  }
}

// Calculate total volume for transactions
function calculateTotalVolume() {
  if (reportType.value !== 'transactions' || !reportData.value.length) return 0;

  return reportData.value.reduce((total: number, item: any) =>
    total + (item.quantidade || 0), 0
  );
}

// Calculate total value for transactions
function calculateTotalValue() {
  if (reportType.value !== 'transactions' || !reportData.value.length) return 0;

  return reportData.value.reduce((total: number, item: any) =>
    total + ((item.quantidade * item.precoUnitario) || 0), 0
  );
}

// Calculate average value per transaction
function calculateAverageValue() {
  if (reportType.value !== 'transactions' || !reportData.value.length) return 0;

  const total = calculateTotalValue();
  return total / reportData.value.length;
}

// Calculate total volume for associados
function calculateTotalAssociadoVolume() {
  if (reportType.value === 'transactions' || !reportData.value.length) return 0;

  return reportData.value.reduce((total: number, item: any) =>
    total + (item.volume || 0), 0
  );
}

// Calculate average transactions for associados
function calculateAverageTransactions() {
  if (reportType.value === 'transactions' || !reportData.value.length) return 0;

  const totalTransactions = reportData.value.reduce((total: number, item: any) =>
    total + (item.transacoes || 0), 0
  );

  return (totalTransactions / reportData.value.length).toFixed(2);
}

// Export as PDF (mock function)
async function exportPDF() {
  exportLoading.value = true;

  // In a real app, we would call a server API to generate PDF
  setTimeout(() => {
    // Simulate PDF generation
    const reportTitle = {
      'transactions': 'Relatório de Transações',
      'producers': 'Relatório de Produtores',
      'buyers': 'Relatório de Compradores'
    }[reportType.value];

    alert(`${reportTitle} exportado com sucesso! (Simulação)`);
    exportLoading.value = false;
  }, 1500);
}

// Export as CSV (mock function)
function exportCSV() {
  if (!reportData.value.length) return;

  let csvContent = "";

  // Add headers based on report type
  if (reportType.value === 'transactions') {
    csvContent = "Data,Comprador,Produtor,Quantidade,Valor Total,Status\n";

    // Add data rows
    reportData.value.forEach((item: any) => {
      csvContent += `${formatDate(item.data)},${item.comprador},${item.produtor},${item.quantidade},${(item.quantidade * item.precoUnitario).toFixed(2)},${item.status}\n`;
    });
  } else {
    csvContent = "Nome,Contato,Documento,Cidade,Estado,Transações,Volume\n";

    // Add data rows
    reportData.value.forEach((item: any) => {
      csvContent += `${item.nome},${item.celular || ''},${item.documento || ''},${item.cidade || ''},${item.estado || ''},${item.transacoes || 0},${item.volume || 0}\n`;
    });
  }

  // Create download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.setAttribute("href", url);
  link.setAttribute("download", `relatorio_${reportType.value}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
</script>