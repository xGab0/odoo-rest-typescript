<script setup lang="ts">
import { deleteModelRecord, type OdooRecord, OdooQuery } from '../../../../lib/rest-api';
import type { DummyUser } from '@/services/dummy';
import { ref, onMounted } from 'vue';
import IconTrash from '../../components/icons/IconTrash.vue';
import PhoneNumber from '../PhoneNumber.vue';

interface Props {
  index: number,
  record: DummyUser,
}

const props = defineProps<Props>();
const checked = ref<boolean>();

async function requestDelete() {
  // Esempio di chiamata alla funzione
  await deleteModelRecord('dummy.user', props.record.id)
      .then(response => console.log(response))
      .catch(error => console.error(error));
}

onMounted(() => {
  console.log(props.record)
});
</script>

<template>
  <div class="row" :class="{ 'selected': checked }">
    <div class="values-container">
        <input v-model="checked" type="checkbox" class="checkboxvalue"/>
        <div>
          <div class="elements">
            <div class="value">{{record.name}}</div> 
            <div class="value">{{record.surname}}</div>
            <!--div class="value">{{record.phone}}</div-->
            <PhoneNumber :number="`39 ${record.phone}`"/>
            <div class="value">{{record.email}}</div>
            <div class="value">{{record.company}}</div>
          </div>
          <div v-if="checked">
            <IconTrash
              fill="transparent"
              stroke="#b04040"
              :strokeWidth="2"
              class="trash-icon"
              @click="requestDelete"
            />
          </div>
          <div v-if="index != 10" class="separator"/>
        </div>
    </div>
  </div>
</template>

<style scoped>
.selected {
  background-color: #ebf8ff;
}

.row {
  width: 100%;

  .values-container {
    display: flex;
    gap: 20px;

    /*
    input {
    }
    */

    div {
      width: 100%;

      .elements {
        padding-top: 10px;
        padding-bottom: 10px;

        display: flex;
        justify-content: space-between;

        .value {
          width: 100%;

          font-size: 14px;
          font-weight: 500;
        }
      }
    }
  }
}

.separator {
  height: 1px;
  background-color: #e6e6e6;
}

@keyframes popIn {
  0% {
    transform: translateY(10px);
    opacity: 1;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

.popIn {
  animation: popIn 2.5s ease forwards;
}

.trash-icon {
  height: 17px;
  cursor: pointer;
}

</style>
