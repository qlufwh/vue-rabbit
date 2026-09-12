import axios from 'axios'
import { ElMessage } from "element-plus";
import "element-plus/theme-chalk/el-message.css";
import {useUserStore} from '@/stores/userStore'
import router from '@/router';
// 创建 axios 实例
const httpInstance = axios.create({
  baseURL: '/api',
  timeout: 5000
})

// axios 请求拦截器
httpInstance.interceptors.request.use(
  config => {
    //1.从pinia获取token数据
      const useStore = useUserStore();
    //2.按照后端的要求拼接我们的token数据
      const token = useStore.userInfo.token
      if(token){
        config.headers.Authorization = `Bearer ${token}`
      }
    return config
  },
  e => Promise.reject(e)
)

// 避免多个接口同时 401 时重复跳转/刷新
let handlingAuthError = false

// axios 响应拦截器
httpInstance.interceptors.response.use(
  res => res.data,
  e => {
    const useStore = useUserStore()
    const resData = e.response?.data
    const isTokenInvalid =
      e.response?.status === 401 ||
      resData?.code === '10019' ||
      resData?.code === 10019

    if (isTokenInvalid) {
      if (!handlingAuthError) {
        handlingAuthError = true
        useStore.clearUserInfo()

        const path = router.currentRoute.value.path
        // 结算等需登录页：去登录；其余公共页清掉坏 token 后刷新，避免首页无数据/无图片
        if (path === '/checkout' || path === '/cartlist' || path.startsWith('/member') || path === '/pay' || path === '/paycallback') {
          ElMessage({ type: 'warning', message: '登录状态已失效，请重新登录' })
          router.push({
            path: '/login',
            query: { redirect: router.currentRoute.value.fullPath }
          })
        } else if (path !== '/login') {
          ElMessage({ type: 'warning', message: '登录状态已失效，正在刷新页面' })
          window.location.reload()
        }
      }
      return Promise.reject(e)
    }

    // 统一处理其他接口错误。
    ElMessage({
      type: 'warning',
      message: resData?.message || '请求失败，请稍后重试'
    })
    return Promise.reject(e)
  }
)

// 获取新鲜好物
export const findNewAPI = () => {
  return httpInstance({
    url: '/home/new'
  })
}

// 获取人气推荐
export const getHotAPI = () => {
  return httpInstance({
    url: '/home/hot',
    method: 'GET'
  })
}

export default httpInstance
