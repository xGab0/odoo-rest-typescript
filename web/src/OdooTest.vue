<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { createModelRecords, getVisitors, getModelRecords, getModelRecord, workingLogin } from '../../lib/rest-api';
import type { Visitor, OdooResponse, AuthResponse } from './services/odooService';

const authToken = ref<string>('');
const modelsSearchBox = defineModel();
const foundRecords = ref();

const loginToOdoo = async () => {
  const response = await workingLogin();
  authToken.value = response.user_id;
}

const getSpecificRecord = async (modelName: string, recordId: number) => {
  const response = await getModelRecord(modelName, recordId);

  console.log(`Specific record with id ${recordId}:`)
  console.log(response);
}

const searchRecords = async (modelName: string) => {
  console.log('searching records for model: ' + modelName);
  const response: OdooResponse<Visitor> = await getModelRecords(modelName);

  foundRecords.value = response.result;
}

onMounted(async () => {
  await loginToOdoo();
  await getVisitors();
  await getSpecificRecord('dummy.user', 128);

  /*
  await createModelRecords(authToken.value, 'eta_visitor_management.visitor', {
    name: 'Gabriele',
    surname: 'Aricò',
    phone: '+39 392 329 8567',
    email: 'aricogabriele2001@gmail.com',
    company: 'Erecta'
  })
  */
});
</script>

<template>
  <div>
    <p>{{ modelsSearchBox }}</p>
    <input v-model="modelsSearchBox">
    <button @click="searchRecords(modelsSearchBox)">cerca i records</button>

    <div v-for="record in foundRecords">
      <p>id: {{record.id}}</p>
      <p>name: {{record.name}}</p>
    </div>
  </div>
</template>

<style scoped>
</style>
