export function debounce(fn, delay = 300) {
  let timer = null;
  return (...args) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

export function throttle(func, delay) {
  let prev = Date.now();
  return function (...args) {
    const now = Date.now();
    if (now - prev >= delay) {
      func.apply(this, args);
      prev = Date.now();
    }
  };
}
