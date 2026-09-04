import axios from 'axios'
import { ElMessage } from "element-plus";
import "element-plus/theme-chalk/el-message.css";
import {useUserStore} from '@/stores/user'
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

// axios 响应拦截器
httpInstance.interceptors.response.use(
  
  res => res.data,
  e => {
    const useStore = useUserStore()
    //统一错误提示
    ElMessage({
      type: "warning",
      message: e.response.data.message,
    });
    //401token失效处理
    //1.清除本地用户数据
    //2.跳转到登录页
    if(e.response.status === 401){
        useStore.clearUserInfo()
        router.push('/login')
    }
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