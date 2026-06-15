import * as PIXI from 'pixi.js';
import { onMounted } from 'vue';

export function useDotMatrix(
  target: string | HTMLElement,
  options?: Partial<PIXI.IRendererOptionsAuto>
) {
  onMounted(() => {
    const _target = typeof target === 'string' ? document.querySelector(target) : target;
    if (!_target) return;
    // 创建一个渲染器，宽高为视窗的宽高
    const renderer = PIXI.autoDetectRenderer({
      width: 100,
      height: 100,
      ...(options || {}),
      backgroundAlpha: 0
    });
    // 把渲染器添加到 HTML 结构里
    _target.appendChild(renderer.view as HTMLCanvasElement);
    // 创建一个 Graphics 对象，用于绘制点阵
    const graphics = new PIXI.Graphics();
    // 设置点的颜色和半径
    graphics.beginFill('0xFFFFFF');
    const radius = 1.5;
    // 设置点阵的行数和列数
    const rows = 5;
    const cols = 5;
    // 设置点阵的间距和边距
    const gap = renderer.screen.width / 5;

    const margin = 0;
    // 循环绘制点阵
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        // 计算点的中心坐标
        const x = margin + radius + (radius * 2 + gap) * i;
        const y = margin + radius + (radius * 2 + gap) * j;
        // 绘制一个实心圆
        graphics.drawCircle(x, y, radius);
      }
    }
    // 将 Graphics 对象添加到渲染器上
    renderer.render(graphics);
  });
}
