import axios from 'axios'

// 创建 axios 实例
const httpInstance = axios.create({
  baseURL: '/api',
  timeout: 5000
})

// axios 请求拦截器
httpInstance.interceptors.request.use(
  config => {
    return config
  },
  e => Promise.reject(e)
)

// axios 响应拦截器
httpInstance.interceptors.response.use(
  res => res.data,
  e => {
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