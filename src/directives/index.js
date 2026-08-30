// 定义懒加载插件
import { useIntersectionObserver } from "@vueuse/core";

const LAZY_MARGIN = 300;

const isNearViewport = (el, margin = LAZY_MARGIN) => {
  const rect = el.getBoundingClientRect();
  return (
    rect.top < window.innerHeight + margin &&
    rect.bottom > -margin &&
    rect.left < window.innerWidth + margin &&
    rect.right > -margin &&
    rect.width > 0 &&
    rect.height > 0
  );
};

export const lazyPlugin = {
  install(app) {
    app.directive("img-lazy", {
      mounted(el, binding) {
        const url = binding.value;
        if (!url) return;

        const load = () => {
          if (el.src === url) return;
          el.src = url;
        };

        if (isNearViewport(el, 0)) {
          load();
          return;
        }

        let loaded = false;
        let ioCleanup = null;

        const tryLoad = () => {
          if (loaded) return;
          if (isNearViewport(el)) {
            loaded = true;
            load();
            if (ioCleanup) ioCleanup();
            window.removeEventListener("scroll", onScroll, true);
            window.removeEventListener("resize", onScroll, true);
          }
        };

        const onScroll = () => {
          tryLoad();
        };

        try {
          const { stop } = useIntersectionObserver(
            el,
            ([{ isIntersecting }]) => {
              if (isIntersecting) {
                loaded = true;
                load();
                stop();
                window.removeEventListener("scroll", onScroll, true);
                window.removeEventListener("resize", onScroll, true);
              }
            },
            {
              rootMargin: `${LAZY_MARGIN}px 0px`,
              threshold: [0, 0.01, 0.1],
            }
          );
          ioCleanup = stop;
        } catch (e) {
          load();
          return;
        }

        window.addEventListener("scroll", onScroll, true);
        window.addEventListener("resize", onScroll, true);

        setTimeout(tryLoad, 100);
        setTimeout(tryLoad, 500);
      },
    });
  },
};
