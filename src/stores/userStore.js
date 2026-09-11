// 管理用户数据相关

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { loginAPI } from '@/apis/userStore'
import { useCartStore } from './cartStore'
import { mergeCartAPI } from '@/apis/cart'

export const useUserStore = defineStore('user', () => {
  const cartStore = useCartStore()
  // 1. 定义管理用户数据的state
  const userInfo = ref({})
  // 2. 定义获取接口数据的action函数
  const getUserInfo = async ({ account, password }) => {
    const res = await loginAPI({ account, password })
    userInfo.value = res.result

    // 登录成功后，将本地购物车转换为接口需要的数据并合并到服务器。
    const localCartList = cartStore.cartList.map(({ skuId, count, selected }) => ({
      skuId,
      count,
      selected
    }))
    await mergeCartAPI(localCartList)
    await cartStore.refreshCartList()
  }
  //退出时清除用户信息
  const clearUserInfo = ()=>{
    userInfo.value = {}
    // 执行清除购物车
    cartStore.clearCart()
  }

  // 3. 以对象的格式把state和action return
  return {
    userInfo,
    getUserInfo,
    clearUserInfo
  }
}, {
  persist: true,
})