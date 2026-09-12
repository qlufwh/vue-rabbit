<script setup>
import { getCheckInfoAPI, addAddressAPI, createOrderAPI } from '@/apis/checkout'
import { useCartStore } from '@/stores/cartStore'
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { regionData, codeToText } from 'element-china-area-data'

const router = useRouter()
const cartStore = useCartStore()
const checkInfo = ref({}) // 订单对象
const curAddress = ref({}) // 当前收货地址

const getCheckInfo = async () => {
  // 结算页以购物车已选数据为准：先同步勾选/数量到服务端
  if (cartStore.selectedCount === 0) {
    ElMessage.warning('请先在购物车勾选商品')
    router.replace('/cartlist')
    return
  }

  await cartStore.syncCartToServer()
  const res = await getCheckInfoAPI()
  checkInfo.value = res.result

  // 接口常返回 goods:[] / summary 全 0，用购物车已选数据填充，保证与购物车一致
  if (!res.result.goods?.length) {
    const selectedGoods = cartStore.cartList.filter((item) => item.selected)
    const totalPrice = selectedGoods.reduce(
      (sum, item) => sum + Number(item.price) * item.count,
      0
    )
    const postFee = Number(res.result.summary?.postFee ?? 0)
    const discountPrice = Number(res.result.summary?.discountPrice ?? 0)
    checkInfo.value.goods = selectedGoods.map((item) => ({
      id: item.id || item.skuId,
      skuId: item.skuId,
      name: item.name,
      attrsText: item.attrsText,
      picture: item.picture,
      price: item.price,
      count: item.count,
      totalPrice: Number(item.price) * item.count,
      totalPayPrice: Number(item.price) * item.count
    }))
    checkInfo.value.summary = {
      goodsCount: selectedGoods.reduce((sum, item) => sum + item.count, 0),
      totalPrice,
      postFee,
      discountPrice,
      totalPayPrice: totalPrice + postFee - discountPrice
    }
  }

  // 按接口约定：isDefault === 1 为默认地址
  const item = checkInfo.value.userAddresses.find(item => item.isDefault === 1)
  curAddress.value = item
}
// 切换地址
const activeAddress = ref({})
const switchAddress = (item) => {
  activeAddress.value = item
}
const confirm = () => {
  curAddress.value = activeAddress.value
  showDialog.value = false
}
const cancel = () => {
  showDialog.value = false
}
onMounted(() => getCheckInfo())
const showDialog = ref(false)

// 添加地址
const addFlag = ref(false)
const region = ref([])
const getEmptyForm = () => ({
  receiver: '',
  contact: '',
  provinceCode: '',
  cityCode: '',
  countyCode: '',
  address: '',
  postalCode: '',
  addressTags: '',
  isDefault: 0,
  fullLocation: ''
})
const addressForm = ref(getEmptyForm())

const padAreaCode = (code = '') => String(code).padEnd(6, '0')

const changeRegion = (val) => {
  if (!val || val.length < 3) return
  addressForm.value.provinceCode = padAreaCode(val[0])
  addressForm.value.cityCode = padAreaCode(val[1])
  addressForm.value.countyCode = padAreaCode(val[2])
  addressForm.value.fullLocation = `${codeToText[val[0]]} ${codeToText[val[1]]} ${codeToText[val[2]]}`
}

const openAddAddress = () => {
  addressForm.value = getEmptyForm()
  region.value = []
  addFlag.value = true
}

const confirmAdd = async () => {
  const form = addressForm.value
  if (!form.receiver || !form.contact || !form.provinceCode || !form.address) {
    ElMessage.warning('请完善收货地址信息')
    return
  }
  const payload = {
    ...form,
    postalCode: form.postalCode || '000000',
    addressTags: form.addressTags || '家'
  }
  const res = await addAddressAPI(payload)
  const newAddress = { ...payload, id: res.result.id }
  if (!checkInfo.value.userAddresses) {
    checkInfo.value.userAddresses = []
  }
  checkInfo.value.userAddresses.push(newAddress)
  curAddress.value = newAddress
  addFlag.value = false
  ElMessage.success('添加收货地址成功')
}

// 配送时间 / 支付方式
const deliveryTimeType = ref(1)
const payType = ref(1)

// 创建订单
const createOrder = async () => {
  if (!curAddress.value?.id) {
    ElMessage.warning('请选择收货地址')
    return
  }
  if (!checkInfo.value.goods?.length) {
    ElMessage.warning('没有可结算的商品')
    return
  }
  const res = await createOrderAPI({
    deliveryTimeType: deliveryTimeType.value,
    payType: payType.value,
    payChannel: 1,
    buyerMessage: '',
    goods: checkInfo.value.goods.map(item => {
      return {
        skuId: item.skuId,
        count: item.count
      }
    }),
    addressId: curAddress.value.id
  })
  const orderId = res.result.id
  router.push({
    path: '/pay',
    query: {
      id: orderId
    }
  })
}
</script>

<template>
  <div class="xtx-pay-checkout-page">
    <div class="container">
      <div class="wrapper">
        <!-- 收货地址 -->
        <h3 class="box-title">收货地址</h3>
        <div class="box-body">
          <div class="address">
            <div class="text">
              <div class="none" v-if="!curAddress || !curAddress.id">您需要先添加收货地址才可提交订单。</div>
              <ul v-else>
                <li><span>收<i />货<i />人：</span>{{ curAddress.receiver }}</li>
                <li><span>联系方式：</span>{{ curAddress.contact }}</li>
                <li><span>收货地址：</span>{{ curAddress.fullLocation }} {{ curAddress.address }}</li>
              </ul>
            </div>
            <div class="action">
              <el-button size="large" @click="showDialog = true">切换地址</el-button>
              <el-button size="large" @click="openAddAddress">添加地址</el-button>
            </div>
          </div>
        </div>
        <!-- 商品信息 -->
        <h3 class="box-title">商品信息</h3>
        <div class="box-body">
          <table class="goods">
            <thead>
              <tr>
                <th width="520">商品信息</th>
                <th width="170">单价</th>
                <th width="170">数量</th>
                <th width="170">小计</th>
                <th width="170">实付</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="i in checkInfo.goods" :key="i.id">
                <td>
                  <a href="javascript:;" class="info">
                    <img :src="i.picture" alt="">
                    <div class="right">
                      <p>{{ i.name }}</p>
                      <p>{{ i.attrsText }}</p>
                    </div>
                  </a>
                </td>
                <td>&yen;{{ i.price }}</td>
                <td>{{ i.count }}</td>
                <td>&yen;{{ i.totalPrice }}</td>
                <td>&yen;{{ i.totalPayPrice }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- 配送时间 -->
        <h3 class="box-title">配送时间</h3>
        <div class="box-body">
          <a
            class="my-btn"
            :class="{ active: deliveryTimeType === 1 }"
            href="javascript:;"
            @click="deliveryTimeType = 1"
          >不限送货时间：周一至周日</a>
          <a
            class="my-btn"
            :class="{ active: deliveryTimeType === 2 }"
            href="javascript:;"
            @click="deliveryTimeType = 2"
          >工作日送货：周一至周五</a>
          <a
            class="my-btn"
            :class="{ active: deliveryTimeType === 3 }"
            href="javascript:;"
            @click="deliveryTimeType = 3"
          >双休日、假日送货：周六至周日</a>
        </div>
        <!-- 支付方式 -->
        <h3 class="box-title">支付方式</h3>
        <div class="box-body">
          <a
            class="my-btn"
            :class="{ active: payType === 1 }"
            href="javascript:;"
            @click="payType = 1"
          >在线支付</a>
          <a
            class="my-btn"
            :class="{ active: payType === 2 }"
            href="javascript:;"
            @click="payType = 2"
          >货到付款</a>
          <span style="color:#999">货到付款需付5元手续费</span>
        </div>
        <!-- 金额明细 -->
        <h3 class="box-title">金额明细</h3>
        <div class="box-body">
          <div class="total" v-if="checkInfo.summary">
            <dl>
              <dt>商品件数：</dt>
              <dd>{{ checkInfo.summary.goodsCount }}件</dd>
            </dl>
            <dl>
              <dt>商品总价：</dt>
              <dd>¥{{ Number(checkInfo.summary.totalPrice).toFixed(2) }}</dd>
            </dl>
            <dl>
              <dt>运<i></i>费：</dt>
              <dd>¥{{ Number(checkInfo.summary.postFee).toFixed(2) }}</dd>
            </dl>
            <dl>
              <dt>应付总额：</dt>
              <dd class="price">{{ Number(checkInfo.summary.totalPayPrice).toFixed(2) }}</dd>
            </dl>
          </div>
        </div>
        <!-- 提交订单 -->
        <div class="submit">
          <el-button @click="createOrder" type="primary" size="large">提交订单</el-button>
        </div>
      </div>
    </div>
  </div>
  <!-- 切换地址 -->
  <el-dialog v-model="showDialog" title="切换收货地址" width="30%" center>
    <div class="addressWrapper">
      <div
        class="text item"
        :class="{ active: activeAddress.id === item.id }"
        @click="switchAddress(item)"
        v-for="item in checkInfo.userAddresses"
        :key="item.id"
      >
        <ul>
          <li><span>收<i />货<i />人：</span>{{ item.receiver }} </li>
          <li><span>联系方式：</span>{{ item.contact }}</li>
          <li><span>收货地址：</span>{{ item.fullLocation + item.address }}</li>
        </ul>
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" @click="confirm">确定</el-button>
      </span>
    </template>
  </el-dialog>
  <!-- 添加地址 -->
  <el-dialog v-model="addFlag" title="添加收货地址" width="600px" center>
    <el-form :model="addressForm" label-width="100px">
      <el-form-item label="收货人">
        <el-input v-model="addressForm.receiver" placeholder="请输入收货人" />
      </el-form-item>
      <el-form-item label="手机号">
        <el-input v-model="addressForm.contact" placeholder="请输入手机号" />
      </el-form-item>
      <el-form-item label="所在地区">
        <el-cascader
          v-model="region"
          :options="regionData"
          placeholder="请选择所在地区"
          style="width: 100%"
          @change="changeRegion"
        />
      </el-form-item>
      <el-form-item label="详细地址">
        <el-input v-model="addressForm.address" placeholder="请输入详细地址" />
      </el-form-item>
      <el-form-item label="邮政编码">
        <el-input v-model="addressForm.postalCode" placeholder="请输入邮政编码" />
      </el-form-item>
      <el-form-item label="地址标签">
        <el-input v-model="addressForm.addressTags" placeholder="请输入地址标签，逗号分隔" />
      </el-form-item>
      <el-form-item label="默认地址">
        <el-switch v-model="addressForm.isDefault" :active-value="1" :inactive-value="0" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="addFlag = false">取消</el-button>
        <el-button type="primary" @click="confirmAdd">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.xtx-pay-checkout-page {
  margin-top: 20px;

  .wrapper {
    background: #fff;
    padding: 0 20px;

    .box-title {
      font-size: 16px;
      font-weight: normal;
      padding-left: 10px;
      line-height: 70px;
      border-bottom: 1px solid #f5f5f5;
    }

    .box-body {
      padding: 20px 0;
    }
  }
}

.address {
  border: 1px solid #f5f5f5;
  display: flex;
  align-items: center;

  .text {
    flex: 1;
    min-height: 90px;
    display: flex;
    align-items: center;

    .none {
      line-height: 90px;
      color: #999;
      text-align: center;
      width: 100%;
    }

    >ul {
      flex: 1;
      padding: 20px;

      li {
        line-height: 30px;

        span {
          color: #999;
          margin-right: 5px;

          >i {
            width: 0.5em;
            display: inline-block;
          }
        }
      }
    }

    >a {
      color: $xtxColor;
      width: 160px;
      text-align: center;
      height: 90px;
      line-height: 90px;
      border-right: 1px solid #f5f5f5;
    }
  }

  .action {
    width: 420px;
    text-align: center;

    .btn {
      width: 140px;
      height: 46px;
      line-height: 44px;
      font-size: 14px;

      &:first-child {
        margin-right: 10px;
      }
    }
  }
}

.goods {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;

  .info {
    display: flex;
    text-align: left;

    img {
      width: 70px;
      height: 70px;
      margin-right: 20px;
    }

    .right {
      line-height: 24px;

      p {
        &:last-child {
          color: #999;
        }
      }
    }
  }

  tr {
    th {
      background: #f5f5f5;
      font-weight: normal;
    }

    td,
    th {
      text-align: center;
      padding: 20px;
      border-bottom: 1px solid #f5f5f5;

      &:first-child {
        border-left: 1px solid #f5f5f5;
      }

      &:last-child {
        border-right: 1px solid #f5f5f5;
      }
    }
  }
}

.my-btn {
  width: 228px;
  height: 50px;
  border: 1px solid #e4e4e4;
  text-align: center;
  line-height: 48px;
  margin-right: 25px;
  color: #666666;
  display: inline-block;

  &.active,
  &:hover {
    border-color: $xtxColor;
  }
}

.total {
  dl {
    display: flex;
    justify-content: flex-end;
    line-height: 50px;

    dt {
      i {
        display: inline-block;
        width: 2em;
      }
    }

    dd {
      width: 240px;
      text-align: right;
      padding-right: 70px;

      &.price {
        font-size: 20px;
        color: $priceColor;
      }
    }
  }
}

.submit {
  text-align: right;
  padding: 60px;
  border-top: 1px solid #f5f5f5;
}

.addressWrapper {
  max-height: 500px;
  overflow-y: auto;
}

.text {
  flex: 1;
  min-height: 90px;
  display: flex;
  align-items: center;

  &.item {
    border: 1px solid #f5f5f5;
    margin-bottom: 10px;
    cursor: pointer;

    &.active,
    &:hover {
      border-color: $xtxColor;
      background: lighten($xtxColor, 50%);
    }

    >ul {
      padding: 10px;
      font-size: 14px;
      line-height: 30px;
    }
  }
}
</style>