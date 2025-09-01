<template>
  <div class="input-group">
    <UiLabel class="sr-only" :for="computedId">{{ computedId }}</UiLabel>
    <UiInput :value="modelValue" @input="$emit('update:modelValue', $event.target.value)" :id="computedId"
      :name="modelName" :placeholder="placeholder" :type="type" :autocapitalize="autocapitalize"
      :autocomplete="autocomplete" :spellcheck="spellcheck" class="input" :disabled="disabled" v-autofocus />
  </div>
</template>

<script setup lang="ts">
  import { computed } from "vue";

  const props = defineProps({
    id: {
      type: String,
      default: "",
    },
    modelValue: String,
    modelName: String,
    placeholder: String,
    disabled: Boolean,
    type: {
      type: String,
      default: "text",
    },
    autocomplete: {
      type: String,
      default: "off",
    },
    autocapitalize: {
      type: String,
      default: "off",
    },
    spellcheck: {
      type: Boolean,
      default: false,
    },
  });

  const computedId = computed(() => props.id || props.modelName);
</script>

<style scoped>
  .input-group {
    @apply flex flex-col space-y-1.5;
  }

  .input {
    @apply h-12;
  }
</style>
