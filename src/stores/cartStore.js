// 封装购物车模块

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'


export const useCartStore = defineStore('cart', () => {
  // 1. 定义state - cartList
  const cartList = ref([])
  // 2. 定义action - addCart
  const addCart = (goods) => {
    console.log('添加', goods)
    // 添加购物车操作
    // 已添加过 - count + 1
    // 没有添加过 - 直接push
    // 思路：通过匹配传递过来的商品对象中的skuId能不能在cartList中找到，找到了就是添加过
    const item = cartList.value.find((item) => goods.skuId === item.skuId)
    if (item) {
      // 找到了
      item.count++
    } else {
      // 没找到
      cartList.value.push(goods)
    }
  }
  // 3. 定义action - delCart
  const delCart = (skuId) => {
    // 通过skuId找到对应的购物车商品，然后从cartList中移除
    const idx = cartList.value.findIndex((item) => item.skuId === skuId)
    cartList.value.splice(idx, 1)
  }
  // 单选功能
  const singleCheck = (skuId, selected) => {
    // 通过skuId找到要修改的那一项 然后把它的selected修改为传过来的selected
    const item = cartList.value.find((item) => item.skuId === skuId)
    item.selected = selected
  }
  // 计算属性 - 总数量
  const allCount = computed(() => cartList.value.reduce((a, c) => a + c.count, 0))
  // 计算属性 - 总价
  const allPrice = computed(() => cartList.value.reduce((a, c) => a + c.count * c.price, 0))
  return {
    cartList,
    addCart,
    delCart,
    singleCheck,
    allCount,
    allPrice
  }
}, {
  persist: true,
})