<script setup>

import LayoutNav from './components/LayoutNav.vue'
import LayoutHeader from './components/LayoutHeader.vue'
import LayoutFooter from './components/LayoutFooter.vue'
import LayoutFixed from './components/LayoutFixed.vue'

import { useCategoryStore } from '@/stores/category.js'
import { onMounted } from 'vue'


const CategoryStore = useCategoryStore()


// 获取分类数据
onMounted(() => {
  CategoryStore.getCategory()
})

</script>


<template>

  <LayoutFixed />

  <LayoutNav />

  <LayoutHeader />

  <RouterView />

  <LayoutFooter />

</template>