<template>
  <div>
    <UiTabs v-model="currentTab" :default-value="firstTab">
      <UiTabsList v-if="tabs.length > 1" :pill="false" class="tabslist">
        <UiTabsTrigger v-for="tab in tabs" :key="tab.value" :value="tab.value" :pill="false">
          {{ tab.label }}
        </UiTabsTrigger>
        <UiTabsIndicator />
      </UiTabsList>
      <component :is="tab.component" v-for="tab in tabs" v-show="currentTab === tab.value" :key="tab.value" />
    </UiTabs>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from "vue";

  const props = defineProps<{
    defaultTab?: string;
    tabsFolder: string;
    order?: string[];
  }>();

  const currentTab = ref(props.defaultTab || "Todos");

  const tabs = computed(() => {
    const tabComponents = import.meta.glob<{ default: Component }>("/components/App/Tab/**/*.vue", {
      eager: true,
    });

    const availableTabs = Object.entries(tabComponents)
      .filter(([key]) => key.includes(props.tabsFolder))
      .map(([key, component]) => {
        const name = key.split("/").pop()?.replace(".vue", "") || "";
        return {
          label: name,
          value: name,
          component: component.default,
        };
      });

    if (props.order) {
      return props.order
        .map((name) => availableTabs.find((tab) => tab.value === name))
        .filter((tab): tab is NonNullable<typeof tab> => tab !== undefined);
    }

    return availableTabs;
  });

  const firstTab = computed(() => tabs.value[0]?.value || "");
</script>

<style scoped>
  .tabslist {
    @apply relative grid auto-cols-auto grid-flow-col justify-start border-b;
  }
</style>