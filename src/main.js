import { createApp } from 'vue'

import { createPinia } from 'pinia'

import "@/styles/common.scss"

import App from './App.vue'

import { useIntersectionObserver } from "@vueuse/core";

import router from './router'


// 测试接口函数
import { getCategoryAPI } from '@/apis/testAPI.js'

getCategoryAPI().then((res) => {
  console.log(res)
})


// 定义懒加载插件
const lazyPlugin = {

  install(app) {

    app.directive("img-lazy", {

      mounted(el, binding) {

        const { stop } = useIntersectionObserver(
          el,
          ([{ isIntersecting }]) => {

            if (isIntersecting) {

              // 加载图片
              el.src = binding.value

              // 停止监听
              stop()

            }

          }
        )

      }

    })

  }

}


const app = createApp(App)


app.use(createPinia())

app.use(router)


// 注册懒加载插件
app.use(lazyPlugin)


app.mount('#app')