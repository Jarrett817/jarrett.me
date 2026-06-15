/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './docs/**/*.{js,ts,jsx,tsx,mdx,vue}',
    './docs/.vitepress/theme/**/*.{js,ts,jsx,tsx,mdx,vue}'
  ],
  options: {
    safelist: ['html', 'body']
  }
};
