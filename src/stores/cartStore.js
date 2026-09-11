// 封装购物车模块

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useUserStore } from './userStore'
import { insertCartAPI, findNewCartListAPI, delCartAPI } from '@/apis/cart'

export const useCartStore = defineStore('cart', () => {
  const userStore = useUserStore()
  const isLogin = computed(() => Boolean(userStore.userInfo.token))
  const cartList = ref([])

  // 登录状态下，每次写操作后都从服务端同步最新购物车。
  const refreshCartList = async () => {
    const { result } = await findNewCartListAPI()
    cartList.value = result
  }

  // 添加商品：登录后操作服务端，未登录时维护本地持久化数据。
  const addCart = async (goods) => {
    const { skuId, count } = goods
    if (isLogin.value) {
      await insertCartAPI({ skuId, count })
      await refreshCartList()
      return
    }

    const item = cartList.value.find((item) => item.skuId === skuId)
    if (item) {
      item.count += count
      return
    }

    cartList.value.push(goods)
  }

  // 根据 SKU 删除商品，避免不同规格的同一商品互相影响。
  const delCart = async (skuId) => {
    if (isLogin.value) {
      await delCartAPI([skuId])
      await refreshCartList()
      return
    }

    cartList.value = cartList.value.filter((item) => item.skuId !== skuId)
  }
  //退出时清除购物车
  const clearCart = () => {
    cartList.value = []
  }
  // 更新单个商品的选中状态。
  const singleCheck = (skuId, selected) => {
    const item = cartList.value.find((item) => item.skuId === skuId)
    if (item) item.selected = selected
  }

  // 将所有商品同步为全选框的当前状态。
  const allCheck = (selected) => {
    cartList.value.forEach((item) => {
      item.selected = selected
    })
  }

  // 空购物车不应显示为全选。
  const isAll = computed(() => cartList.value.length > 0 && cartList.value.every((item) => item.selected))
  const allCount = computed(() => cartList.value.reduce((a, c) => a + c.count, 0))
  const allPrice = computed(() => cartList.value.reduce((a, c) => a + c.count * c.price, 0))

  // 复用选中商品集合，避免数量和金额统计重复筛选购物车。
  const selectedItems = computed(() => cartList.value.filter((item) => item.selected))
  const selectedCount = computed(() => selectedItems.value.reduce((total, item) => total + item.count, 0))
  const selectedPrice = computed(() => selectedItems.value.reduce(
    (total, item) => total + item.count * item.price,
    0
  ))

  return {
    cartList,
    addCart,
    delCart,
    singleCheck,
    allCheck,
    clearCart,
    selectedCount,
    selectedPrice,
    isAll,
    allCount,
    allPrice
  }
}, {
  persist: true,
})