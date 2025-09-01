<template>
  <div>
    <AppPage>
      <UiCard class="mt-10">
        <UiCardContent>
          <UiGenericDatatable model="Comprador" :columns="columns" />
        </UiCardContent>
      </UiCard>
    </AppPage>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ["auth"]
});

const columns = [
  {
    label: "ID",
    field: "id",
    type: "text"
  },
  {
    label: "Nome",
    field: "name",
    type: "text"
  },
  {
    label: "Celular",
    field: "celular",
    type: "phone"
  },
  {
    label: "Documento",
    field: "documento",
    type: "text"
  },
  {
    label: "Endereço",
    field: "endereco",
    type: "text",
    collapsible: true
  },
  {
    label: "Cidade",
    field: "cidade",
    type: "text"
  },
    {
    label: "Estado",
    field: "estado.sigla",
    type: "relation",
    relationModalLabel: "nome"
  }
];
</script>