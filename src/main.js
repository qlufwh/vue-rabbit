import { createApp } from 'vue'

import { createPinia } from 'pinia'

import "@/styles/common.scss"

import App from './App.vue'

import { useIntersectionObserver } from "@vueuse/core";

import router from './router'

import {lazyPlugin} from "@/directives"

// 测试接口函数
import { getCategoryAPI } from '@/apis/testAPI.js'

getCategoryAPI().then((res) => {
  console.log(res)
})



const app = createApp(App)


app.use(createPinia())

app.use(router)


// 注册懒加载插件
app.use(lazyPlugin)


app.mount('#app')