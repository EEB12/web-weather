<script setup lang="ts">
const searchTerm = ref('')
const selectedItem = ref(null)
const items = ref(['Backlog', 'Todo', 'In Progress', 'Done'])
const value = ref('')
</script>

<template>
  <div class="h-screen relative bg-cover bg-center bg-no-repeat bg-[url(/rain.jpg)] " >
    <!-- Semi-transparent black overlay -->
    <div class="absolute inset-0 bg-black/70 z-0"></div>
    
    <!-- Content layer -->
    <div class="relative z-10 w-full h-full flex flex-row gap-4 p-4">
      <div class="w-3/4 flex flex-col">
         <UInputMenu 
           class="w-full !rounded-3xl mb-5 " 
           v-model="value" 
           :items="items" 
           variant="subtle" 
           trailing-icon="i-lucide-search"
           :ui="{ base: ' bg-gray-500 rounded-3xl focus:!ring-gray-500' }"
         />
        <div class="w-full h-full bg-white/20 backdrop-blur-md rounded-2xl px-3 pt-4">
          <span class="text-white">
            tes tes test yadadadededaedayada
          </span>
        </div>
      </div>

      <div class="w-full flex flex-col gap-5">
        <div class="h-1/3 bg-white/20 backdrop-blur-md rounded-2xl px-3  text-white">Selected: {{ value || 'None' }}</div>
        <div class="h-1/3 bg-white/20 backdrop-blur-md rounded-2xl px-3  text-white">Selected: {{ value || 'None' }}</div>
        <div class="h-1/3 bg-white/20 backdrop-blur-md rounded-2xl px-3  text-white">Selected: {{ value || 'None' }}</div>
      </div>
    </div>
  </div>
</template>