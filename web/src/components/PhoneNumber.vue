<script setup lang="ts">
import { computed, ref, onMounted, type ComputedRef } from 'vue';

interface Props {
  number: string
}

const { number } = defineProps<Props>();

const prefix = computed(() => {
  return number.substring(0, 2);
});

const suffix = computed(() => {
  return number.substring(2);
});
</script>

<template>
  <div>
    <span class="prefix">
      +{{prefix}}
    </span>
    <span class="suffixclass">
      {{suffix}}
    </span>
  </div>
</template>

<style scoped>
.prefix {
  font-size: 13px;
}
.suffix {
  font-size: 14px;
}
</style>
