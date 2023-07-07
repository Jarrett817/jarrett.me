declare module 'reveal.js'
declare module 'reveal.js/plugin/markdown/markdown.esm.js'
interface Window {
  requestAnimationFrame(callback: FrameRequestCallback): number
}