<script setup lang="ts">
import type { DummyUser } from '@/services/dummy';
import type { Row } from '@/services/table';
import { ref, onMounted } from 'vue';

interface Props {
  row: Row<DummyUser>,
  selected: boolean,
}

const props = defineProps<Props>();
const checked = ref<boolean>();
</script>

<template>
  <div class="row">
    <div class="values-container">
        <input type="checkbox" class="checkboxvalue"/>
        <div>
          <div class="elements">
            <div class="value">dummy name</div>
            <div class="value">dummy surname</div>
            <div class="value">dummy phone</div>
            <div class="value">dummy email</div>
            <div class="value">dummy company</div>
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
</style>
