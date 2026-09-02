import { createApp } from 'vue'

import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import "@/styles/common.scss"

import App from './App.vue'

import { useIntersectionObserver } from "@vueuse/core";

import router from './router'

import {lazyPlugin} from "@/directives"

// 引入全局组件插件
import { componentPlugin } from '@/components'

// 抑制Element Plus点击SVG图标时className报错
window.addEventListener('error', (e) => {
  if (e.message.includes('indexOf is not a function')) e.preventDefault()
})

// 测试接口函数
import { getCategoryAPI } from '@/apis/testAPI.js'

getCategoryAPI().then((res) => {
  console.log(res)
})



const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)

app.use(router)


// 注册懒加载插件
app.use(lazyPlugin)

// 注册全局组件插件
app.use(componentPlugin)

app.mount('#app')