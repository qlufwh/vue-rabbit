// 定义懒加载插件
import { useIntersectionObserver } from "@vueuse/core";

export const lazyPlugin = {
  install(app) {
    app.directive("img-lazy", {
      mounted(el, binding) {
        const url = binding.value;
        if (!url) return;

        const { stop } = useIntersectionObserver(
          el,
          ([{ isIntersecting }]) => {
            if (isIntersecting) {
              el.src = url;
              stop();
            }
          }
        );

        // 兜底：布局未算出尺寸时 IntersectionObserver 可能不触发
        setTimeout(() => {
          if (!el.getAttribute("src")) {
            el.src = url;
            stop();
          }
        }, 800);
      },
      // 数据异步更新后，同步最新图片地址
      updated(el, binding) {
        if (binding.value && el.src !== binding.value && el.getAttribute("src")) {
          el.src = binding.value;
        }
      },
    });
  },
};
