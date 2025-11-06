<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'app'
})
</script>

<template>
  <div>
    <AppPage>
      <template #header>
        <AppHeaderTitle>Dashboard</AppHeaderTitle>
        <AppHeaderDescription>
          Visão geral e análise de dados do sistema
        </AppHeaderDescription>
      </template>

      <div class="space-y-6">
        <!-- Heatmap de Vendas por Estado (Largura Total) -->
        <UiCard>
          <UiCardHeader>
            <UiCardTitle>Vendas por Estado</UiCardTitle>
            <UiCardDescription>
              Mapa de calor das vendas por região
            </UiCardDescription>
          </UiCardHeader>
          <UiCardContent>
            <ClientOnly>
              <BrazilHeatmap />
              <template #fallback>
                <div class="text-gray-500 dark:text-gray-400 text-center py-8">
                  Carregando mapa...
                </div>
              </template>
            </ClientOnly>
          </UiCardContent>
        </UiCard>

        <!-- Gráficos em Grid -->
        <div class="grid gap-6 lg:grid-cols-2">
          <!-- Gráfico de Frequência de Vendas -->
          <UiCard>
            <UiCardHeader>
              <UiCardTitle>Produtores Mais Ativos</UiCardTitle>
              <UiCardDescription>
                Quantidade de vendas por produtor
              </UiCardDescription>
            </UiCardHeader>
            <UiCardContent>
              <SalesFrequencyChart />
            </UiCardContent>
          </UiCard>

          <!-- Gráfico de Comparação de Preços -->
          <UiCard>
            <UiCardHeader>
              <UiCardTitle>Comparação de Preços</UiCardTitle>
              <UiCardDescription>
                Evolução dos preços: Produtor vs CEPEA
              </UiCardDescription>
            </UiCardHeader>
            <UiCardContent>
              <PriceComparisonChart />
            </UiCardContent>
          </UiCard>
        </div>
      </div>
    </AppPage>
  </div>
</template>
