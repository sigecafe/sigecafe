<script setup lang="ts">

    const props = defineProps<{
        sLabel: string | undefined,
        sId: string,
        sPlaceholder: string,
        sItens: { value: string; label: string }[]
    }>()

</script>

<template>
    <Label v-if="sLabel" :for="sId">{{ sLabel }}</Label>
    <UiSelect>
        <UiSelectTrigger :id="sId">
            <UiSelectValue :placeholder="sPlaceholder" />
        </UiSelectTrigger>
        <UiSelectContent position="popper">
            <UiSelectItem v-for="item of sItens" :value="item.value">
                {{ item.label }}
            </UiSelectItem>
        </UiSelectContent>
    </UiSelect>
</template>