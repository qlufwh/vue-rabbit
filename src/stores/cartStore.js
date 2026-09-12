// 封装购物车模块

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useUserStore } from './userStore'
import {
  insertCartAPI,
  findNewCartListAPI,
  delCartAPI,
  updateCartAPI,
  checkAllCartAPI
} from '@/apis/cart'

export const useCartStore = defineStore('cart', () => {
  const cartList = ref([])

  // 使用时再获取用户仓库，避免用户仓库与购物车仓库循环初始化。
  const isLogin = () => Boolean(useUserStore().userInfo.token)

  // 登录状态下，每次写操作后都从服务端同步最新购物车。
  const refreshCartList = async () => {
    const { result } = await findNewCartListAPI()
    cartList.value = result
  }

  // 添加商品：登录后操作服务端，未登录时维护本地持久化数据。
  const addCart = async (goods) => {
    const { skuId, count } = goods
    if (isLogin()) {
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
    if (isLogin()) {
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

  // 更新单个商品的选中状态（登录后同步服务端，结算页才能读到已选商品）
  const singleCheck = async (skuId, selected) => {
    const item = cartList.value.find((item) => item.skuId === skuId)
    if (!item) return
    item.selected = selected
    if (isLogin()) {
      await updateCartAPI(skuId, { selected, count: item.count })
    }
  }

  // 将所有商品同步为全选框的当前状态。
  const allCheck = async (selected) => {
    cartList.value.forEach((item) => {
      item.selected = selected
    })
    if (isLogin()) {
      await checkAllCartAPI({
        selected,
        ids: cartList.value.map((item) => item.skuId)
      })
    }
  }

  // 修改商品数量（登录后同步服务端）
  const updateCount = async (skuId, count) => {
    const item = cartList.value.find((item) => item.skuId === skuId)
    if (!item) return
    item.count = count
    if (isLogin()) {
      await updateCartAPI(skuId, { count, selected: item.selected })
    }
  }

  // 下单前把本地勾选/数量全部同步到服务端，保证结算金额一致
  const syncCartToServer = async () => {
    if (!isLogin()) return
    await Promise.all(
      cartList.value.map((item) =>
        updateCartAPI(item.skuId, { selected: item.selected, count: item.count })
      )
    )
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
    refreshCartList,
    singleCheck,
    allCheck,
    updateCount,
    syncCartToServer,
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
