<template>
  <div
    class="extension-item"
    v-bind="$attrs"
  >
    <p style="display: flex; justify-content: space-between">
      <span class="text-overflow" style="font-size: 16px; height: 22px; line-height: 22px; user-select: none;">{{ props.data.title }}</span>
      <span
        class="extension-item-tip"
        :class="props.data.from === 'tab' ? 'extension-item-close' : ''"
        @click="onClose"
      >{{ props.data.from }}</span>
    </p>
    <p class="extension-item-tip text-overflow">{{ props.data.url }}</p>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  data: {
    type: Object,
    required: true
  }
})

const emits = defineEmits([''])

function onClose() {
  emits('close')
}
</script>

<style scoped>
.extension-item {
  border-bottom: 1px solid #b4b4b6;
  user-select: none;
}

.text-overflow {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.extension-item:focus {
  background-color: #b5e1fa;
}

.extension-item-tip {
  font-size: 10px!important;
  height: 17px;
  line-height: 17px;
  color: #5ca8f2;
  user-select: none;
}

.extension-item-close:hover {
  color: red;
  cursor: pointer;
}
</style>
