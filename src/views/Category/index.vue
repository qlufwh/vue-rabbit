```vue
<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

import { getTopCategoryAPI } from '@/apis/category'
import { getBannerAPI } from '@/apis/home'

import GoodsItem from '../Home/components/Goodsitem.vue'

// 获取路由参数
const route = useRoute()

// 分类数据
const categoryData = ref({})

// Banner 数据
const bannerList = ref([])

// 获取 Banner
const getBanner = async () => {
  const res = await getBannerAPI({
    distributionSite: '2'
  })

  console.log('Banner数据：', res)

  bannerList.value = res.result
}

// 获取分类数据
const getCategory = async () => {
  const res = await getTopCategoryAPI(route.params.id)

  console.log('分类数据：', res)

  categoryData.value = res.result
}

// 页面加载后执行
onMounted(() => {
  getBanner()
  getCategory()
})
</script>

<template>
  <div class="top-category">
    <div class="container m-top-20">

      <!-- 面包屑 -->
      <div class="bread-container">
        <el-breadcrumb separator=">">
          <el-breadcrumb-item :to="{ path: '/' }">
            首页
          </el-breadcrumb-item>

          <el-breadcrumb-item>
            {{ categoryData.name }}
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <!-- Banner 轮播图 -->
      <div class="home-banner">
        <el-carousel height="500px">
          <el-carousel-item
            v-for="item in bannerList"
            :key="item.id"
          >
            <img
              :src="item.imgUrl"
              alt=""
            />
          </el-carousel-item>
        </el-carousel>
      </div>

      <!-- 全部分类 -->
      <div class="sub-list">
        <h3>全部分类</h3>

        <ul>
          <li
            v-for="item in categoryData.children"
            :key="item.id"
          >
            <RouterLink to="/">
              <img
                :src="item.picture"
                alt=""
              />

              <p>
                {{ item.name }}
              </p>
            </RouterLink>
          </li>
        </ul>
      </div>

      <!-- 推荐商品 -->
      <div
        v-for="item in categoryData.children"
        :key="item.id"
        class="ref-goods"
      >
        <div class="head">
          <h3>
            - {{ item.name }} -
          </h3>
        </div>

        <div class="body">
          <GoodsItem
            v-for="good in item.goods"
            :key="good.id"
            :goods="good"
          />
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped lang="scss">
.top-category {

  h3 {
    font-size: 28px;
    color: #666;
    font-weight: normal;
    text-align: center;
    line-height: 100px;
  }

  // 面包屑
  .bread-container {
    padding: 25px 0;
  }

  // Banner
  .home-banner {
    width: 1240px;
    height: 500px;
    margin: 0 auto;

    img {
      width: 100%;
      height: 500px;
      object-fit: cover;
    }
  }

  // 全部分类
  .sub-list {
    margin-top: 20px;
    background-color: #fff;

    ul {
      display: flex;
      padding: 0 32px;
      flex-wrap: wrap;

      li {
        width: 168px;
        height: 160px;

        a {
          display: block;
          text-align: center;
          font-size: 16px;

          img {
            width: 100px;
            height: 100px;
            object-fit: contain;
          }

          p {
            line-height: 40px;
          }

          &:hover {
            color: $xtxColor;
          }
        }
      }
    }
  }

  // 推荐商品
  .ref-goods {
    position: relative;
    margin-top: 20px;
    background-color: #fff;

    .head {

      h3 {
        margin: 0;
      }

      .xtx-more {
        position: absolute;
        top: 20px;
        right: 20px;
      }

      .tag {
        position: relative;
        top: -20px;

        text-align: center;
        color: #999;
        font-size: 20px;
      }
    }

    .body {
      display: flex;
      justify-content: space-around;
      padding: 0 40px 30px;
    }
  }
}
</style>
```
