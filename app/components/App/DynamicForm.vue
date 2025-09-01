<template>
  <div>
    form
    <form @submit.prevent="handleSubmit">
      <div v-for="field in modelFields" :key="field.name">
        <label :for="field.name">{{ field.name }}</label>
        <input v-model="formData[field.name]" :type="field.type" :id="field.name" :required="field.isRequired" />
      </div>
      <button type="submit">Submit</button>
    </form>
  </div>
</template>

<script setup>
  import { ref } from 'vue';

  const props = defineProps({
    modelName: String
  });

  const modelFields = ref([]);
  const formData = ref({});

  onMounted(async () => {
    modelFields.value = await getModelMetadata(props.modelName);
    modelFields.value.forEach(field => {
      formData.value[field.name] = ''; // Initialize form data based on fields
    });

    console.log(modelFields.value);
  });

  function handleSubmit() {
    console.log(formData.value);
    // Add logic to handle form submission, such as making an API call
  }
</script>