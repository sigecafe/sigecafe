# Scripts de População do Banco de Dados

Scripts para popular o banco de dados com dados realistas para análise de dados e visualizações.

## 📋 Scripts Disponíveis

### 1. `populate-transacoes.mjs`
Gera transações de café com dados realistas para análise.

**Características:**
- ✅ 500 transações por padrão (configurável)
- ✅ Histórico de 24 meses
- ✅ 3 variedades: Arábica (50%), Robusta (35%), Conilon (15%)
- ✅ Preços com variação sazonal realista
- ✅ Distribuição de volumes realista (mais pequenas, algumas grandes)
- ✅ Status: Concluída (70%), Pendente (20%), Cancelada (10%)
- ✅ Observações variadas

**Uso:**
```bash
npm run db:populate
```

**Configuração:**
Edite o arquivo `scripts/populate-transacoes.mjs`:
```javascript
const NUM_TRANSACOES = 500;  // Altere para gerar mais/menos transações
const MESES_HISTORICO = 24;  // Altere o período de histórico
```

### 2. `populate-precos-historicos.mjs`
Gera histórico de preços diários do café (Arábica e Robusta).

**Características:**
- ✅ 2 anos de dados diários (exceto finais de semana)
- ✅ Variação sazonal (safra: maio-setembro)
- ✅ Volatilidade diária realista
- ✅ Eventos aleatórios de mercado
- ✅ Correlação entre Arábica e Robusta
- ✅ Tendência de longo prazo

**Uso:**
```bash
npm run db:populate-precos
```

### 3. Popular Tudo
Executa ambos os scripts em sequência:

```bash
npm run db:populate-all
```

## 🚀 Como Usar

### Primeira Vez (Setup Completo)

1. **Certifique-se de ter usuários cadastrados:**
   ```bash
   npm run db:seed
   ```
   Isso criará produtores e compradores necessários.

2. **Popular preços históricos:**
   ```bash
   npm run db:populate-precos
   ```

3. **Popular transações:**
   ```bash
   npm run db:populate
   ```

   Ou tudo de uma vez:
   ```bash
   npm run db:populate-all
   ```

### Gerar Mais Dados

Se quiser adicionar mais transações sem apagar as existentes:

1. Edite `scripts/populate-transacoes.mjs`
2. Comente a linha que limpa o banco:
   ```javascript
   // await prisma.transacao.deleteMany({});
   ```
3. Execute novamente:
   ```bash
   npm run db:populate
   ```

## 📊 Dados Gerados

### Transações
- **Quantidade:** 500 transações (padrão)
- **Período:** Últimos 24 meses
- **Variedades:**
  - Arábica: ~50% (R$ 1.200 - R$ 1.800/saca)
  - Robusta: ~35% (R$ 800 - R$ 1.200/saca)
  - Conilon: ~15% (R$ 700 - R$ 1.000/saca)
- **Volumes:** 5 a 750 sacas por transação
- **Status:** Concluída (70%), Pendente (20%), Cancelada (10%)

### Preços Históricos
- **Registros:** ~500 dias úteis (2 anos)
- **Variedades:** Arábica e Robusta
- **Atualização:** Diária (exceto finais de semana)
- **Fonte:** CEPEA/ESALQ

## 🎯 Casos de Uso para Análise

Com esses dados você pode criar:

### 1. Análises Temporais
- Evolução de preços ao longo do tempo
- Sazonalidade de transações
- Tendências de mercado

### 2. Análises por Variedade
- Comparação de preços entre variedades
- Volume transacionado por tipo
- Preferências de mercado

### 3. Análises de Performance
- Produtores mais ativos
- Compradores com maior volume
- Taxa de conclusão de transações

### 4. Visualizações
- Gráficos de linha (evolução temporal)
- Gráficos de pizza (distribuição por variedade)
- Gráficos de barra (volume por período)
- Heatmaps (sazonalidade)
- Scatter plots (preço x volume)

## ⚙️ Personalização Avançada

### Ajustar Distribuição de Variedades

Em `populate-transacoes.mjs`:
```javascript
const VARIEDADES = {
  'Arábica': { min: 1200, max: 1800, peso: 0.5 },   // 50%
  'Robusta': { min: 800, max: 1200, peso: 0.35 },   // 35%
  'Conilon': { min: 700, max: 1000, peso: 0.15 }    // 15%
};
```

### Ajustar Distribuição de Status

```javascript
const STATUS = [
  { value: 'CONCLUIDA', peso: 0.7 },   // 70%
  { value: 'PENDENTE', peso: 0.2 },    // 20%
  { value: 'CANCELADA', peso: 0.1 }    // 10%
];
```

### Ajustar Faixa de Volumes

```javascript
function gerarQuantidade() {
  if (rand < 0.5) return Math.floor(Math.random() * 30) + 5;    // 5-35 sacas
  if (rand < 0.8) return Math.floor(Math.random() * 70) + 30;   // 30-100 sacas
  if (rand < 0.95) return Math.floor(Math.random() * 150) + 100; // 100-250 sacas
  return Math.floor(Math.random() * 500) + 250;                  // 250-750 sacas
}
```

## 🔍 Verificar Dados

Após popular, você pode verificar os dados:

### Via Prisma Studio
```bash
npm run db:studio
```

### Via SQL
```bash
# Total de transações
SELECT COUNT(*) FROM "Transacao";

# Transações por variedade
SELECT variedade, COUNT(*) as total 
FROM "Transacao" 
GROUP BY variedade;

# Volume total por variedade
SELECT variedade, SUM(quantidade) as volume_total 
FROM "Transacao" 
GROUP BY variedade;

# Preços médios por variedade
SELECT variedade, AVG("precoUnitario") as preco_medio 
FROM "Transacao" 
GROUP BY variedade;
```

## 🚨 Importante

- ⚠️ Os scripts **limpam os dados existentes** por padrão
- ⚠️ Certifique-se de ter backup se necessário
- ⚠️ Execute em ambiente de desenvolvimento primeiro
- ⚠️ Ajuste `NUM_TRANSACOES` conforme capacidade do servidor

## 📈 Sugestões para o Projeto

Para análise de dados, recomendo:

1. **Gerar bastante dados:** 1000-5000 transações
2. **Período longo:** 24-36 meses de histórico
3. **Variar usuários:** Adicione mais produtores/compradores
4. **Criar dashboards com:**
   - Chart.js ou ApexCharts
   - Filtros por período, variedade, status
   - KPIs: volume total, valor médio, tendências
   - Análise preditiva (regressão linear)

## 🤝 Contribuindo

Para melhorar os scripts:
1. Adicione mais variáveis realistas
2. Implemente padrões sazonais mais complexos
3. Adicione correlação com eventos externos
4. Crie scripts para outros modelos (ofertas, notificações)

