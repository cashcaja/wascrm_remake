<script lang="ts" setup>
import {RouterView} from 'vue-router';
</script>

<template>
  <RouterView />
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1); /* 轨道为淡黑色半透明 */
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.5); /* 滑块为黑色半透明 */
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.7); /* 滑块为黑色略微透明 */
}
</style>
