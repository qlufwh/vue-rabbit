<template>
  <div class="test">我是layout</div>
  <!-- 添加二级路由出口 -->
  <router-view />
</template>

<script>
export default {};
</script>

<!-- 这里注意要加lang -->
<style scoped lang="scss">
.test {
  // 直接在这里使用就可以了
  color: $priceColor;
}
</style>