<script setup lang="ts">
import { type OdooRecord, OdooQuery } from '../../lib/rest-api';
import type { DummyUser } from '@/services/dummy';
import { ref, onMounted } from 'vue';

interface Props {
  index: number,
  record: DummyUser,
  selected: boolean,
}

const props = defineProps<Props>();
const checked = ref<boolean>();

onMounted(() => {
});
</script>

<template>
  <div class="row">
    <div class="values-container">
        <input type="checkbox" class="checkboxvalue"/>
        <div>
          <div class="elements">
            <div class="value">{{record.name}}</div>
            <div class="value">{{record.surname}}</div>
            <div class="value">{{record.phone}}</div>
            <div class="value">{{record.email}}</div>
            <div class="value">{{record.company}}</div>
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

</style>
