import request from "@/utils/http"
// 加入购物车
export const insertCartAPI = ({ skuId, count }) => {
  return request({
    url: '/member/cart',
    method: 'POST',
    data: {
      skuId,
      count
    }
  })
}
// 获取购物车列表
export const findNewCartListAPI = () => {
  return request({
    url: '/member/cart'
  })
}
// 删除购物车
export const delCartAPI = (ids) => {
  return request({
    url: '/member/cart',
    method: 'DELETE',
    data: {
      ids
    }
  })

}
// 合并购物车
export const mergeCartAPI = (data) => {
  return request({
    url:'/member/cart/merge',
    method:'POST',
    data
  })
}

// 修改购物车单品（选中状态 / 数量）
export const updateCartAPI = (skuId, data) => {
  return request({
    url: `/member/cart/${skuId}`,
    method: 'PUT',
    data
  })
}

// 购物车全选 / 取消全选
export const checkAllCartAPI = ({ selected, ids }) => {
  return request({
    url: '/member/cart/selected',
    method: 'PUT',
    data: {
      selected,
      ids
    }
  })
}
