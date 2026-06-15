import * as PIXI from 'pixi.js';
import { onMounted } from 'vue';
import { useResizeObserver } from '@vueuse/core';

function draw(mask: PIXI.Graphics, app: PIXI.Application<PIXI.ICanvas>) {
  mask.clear();
  mask.beginFill(0xffffff);

  // 绘制一个红色的三次贝塞尔曲线，从左上角到右下角
  mask.beginFill(0x6abacf);
  const width = app.screen.width;
  const height = app.screen.height;
  const getX = (width: number) => (width / 600) * app.screen.width;
  const getY = (height: number) => (height / 500) * app.screen.height;

  mask.moveTo(getX(183), 0);
  mask.bezierCurveTo(getX(219), getY(77), getX(341), getY(53), getX(379), getY(108));
  mask.bezierCurveTo(getX(446), getY(204), getX(381), getY(319), getX(440), getY(439));
  mask.bezierCurveTo(getX(465), getY(490), getX(524), getY(500), getX(526), getY(500));
  mask.lineTo(width, height);
  mask.lineTo(width, 0); // 右上角
  // mask.lineTo(0, 0) // 左上角
  mask.endFill();
}

export function useBackground() {
  onMounted(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    // 创建一个pixi应用，使用window.innerWidth和window.innerHeight作为画布宽度和高度
    const app = new PIXI.Application({
      width,
      height,
      backgroundColor: 0xffffff, // 画布背景色
      resizeTo: window
    });

    // 将画布添加到页面中，并设置其样式为fixed和z-index为-1
    const dom = app.view as HTMLCanvasElement;
    document.body.appendChild(dom);
    if (dom.style) {
      dom.style.position = 'fixed';
      dom.style.zIndex = '-1';
      dom.style.top = '0';
      dom.style.left = '0';
    }

    // 创建一个遮罩对象，用来分割图形
    const mask = new PIXI.Graphics();
    // 将遮罩对象添加到舞台上
    app.stage.addChild(mask);
    // const image = new PIXI.Sprite(app.renderer.generateTexture(mask))
    // app.stage.addChildAt(image, 0)
    // image.width = app.screen.width
    // image.height = app.screen.height
    // image.x = 0
    // image.y = 0
    useResizeObserver(document.body, () => draw(mask, app));
  });
}
