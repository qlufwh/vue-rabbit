import request from '@/utils/http'
/**
 * 获取结算信息
 */
export const getCheckInfoAPI = () => {
    return request({
        url: '/member/order/pre'
    })
}

/**
 * 添加收货地址
 */
export const addAddressAPI = (data) => {
    return request({
        url: '/member/address',
        method: 'POST',
        data
    })
}

/**
 * 创建订单
 */
export const createOrderAPI = (data) => {
    return request({
        url: '/member/order',
        method: 'POST',
        data
    })
}