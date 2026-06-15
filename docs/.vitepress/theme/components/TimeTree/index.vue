<script lang="ts" setup>
import { Tree } from '../../../utils/love';
import { onMounted } from 'vue';

onMounted(() => {
  const canvas: HTMLCanvasElement = document.querySelector('#canvas')!;

  const width = 500; // 500
  const height = 680; // 680
  const opts = {
    branch: [
      [
        0,
        0,
        -20,
        height / 2,
        -40,
        (height * 3) / 5,
        30,
        100,
        [
          [
            -10,
            height / 4 - 30,
            -60,
            height / 4 + 30,
            -160,
            height / 4 + 60,
            13,
            100,
            [[-60, height / 4 + 16, -80, height / 4 + 40, -120, height / 4 + 70, 2, 40]]
          ],
          [
            0,
            height / 4,
            60,
            height / 4 + 30,
            140,
            height / 4 + 90,
            12,
            100,
            [[40, height / 4 + 18, 130, height / 4 + 30, 140, height / 4 + 40, 3, 80]]
          ],
          [50, height / 4 + 30, 100, height / 4 + 80, 130, height / 4 + 100, 3, 40],
          [
            -14,
            height / 3 + 20,
            50,
            height / 3 + 80,
            100,
            height / 3 + 100,
            9,
            80,
            [
              [0, height / 3 + 30, 30, height / 3 + 80, 60, height / 3 + 100, 2, 40],
              [10, height / 3 + 36, 80, height / 3 + 46, 110, height / 3 + 60, 4, 60]
            ]
          ],
          [
            -30,
            height / 2,
            -70,
            height / 2 + 10,
            -110,
            height / 2 + 20,
            6,
            100,
            [[-35, height / 2, -70, height / 2 - 10, -100, height / 2 - 12, 2, 80]]
          ]
        ]
      ]
    ],
    bloom: {
      num: 700,
      width,
      height
    }
  };

  const tree = new Tree(canvas, width, height, opts);

  tree.start();
});
</script>

<template>
  <div class="time-tree bg-cover bg-contain bg-no-repeat">
    <canvas id="canvas" />
  </div>
</template>
