# 前端导航方案

## 痛点

在使用 vue-router 进行中后台项目开发时，存在以下痛点

1. router.push 到一个新页面，需要有返回操作，返回操作可能会有参数携带，并且需要显示上级页面名称及当前页面名称
2. 多级面包屑的跳转，考虑参数携带
3. 基于 qiankun 等的微应用的主子跳转、子子跳转，新开 tab 的问题
4. 出于安全问题浏览器不提供上一个历史记录的接口

## 相关特性

- `http.referer` 只能够获取除了 `hash` 之外的 `url`
- `document.referrer` 行为与 `http.referer` 不一致，通过 a 标签跳转可以获取除了 `hash` 外的完整 `url`，链接直接点开或者粘贴网址进入都为空字符串，经测试，`push` 等方法无法改变 `document`.`referrer`，但是可以改变 `http.referer`，不包括 `hash`
- `history` 历史栈，`router.push` 即 `history.pushState` 压栈，`router.replace` 即 `history.replaceState` 修改当前记录，`a` 标签的跳转不会压栈，`vue-router` 的重定向也不会压栈
- `back()`和 `go(-1)`，mdn 描述为一致，都等于点击浏览器的回退，但是在一些说法中有人提出 `go(-1)`会重载页面，`back` 不会重载
- `back/forward cache`。浏览器的前进/回退缓存，可以缓存浏览过的页面快照（包括 `JavaScript` 堆），使用 `bfcache` 恢复的重复访问总是比非 `bfcache` 导航更快

## 需求描述

在需要返回按钮的页面，获取上一个路由的路由信息及正确的路由返回

## 方案

### 方案一

选择采用 `sessionStorage`，记录上一页的路由信息

全局混入全局前置路由守卫，记录离开页面的路由信息，如

```js
router.beforeEach((to, from, next) => {
  sessionStorage.set(to.name, from);
});
```

同时提供一个返回方法，获取缓存的路由信息并使用 `push` 返回

#### 优点

- 自动记录，用户无需关注参数的传递

#### 缺点

- 仅限两级跳转的简单场景，多级跳转情况下，来源路由会反调

### 方案二

同样采用 `sessionStorage`存储路由信息

全局混入 `beforeRouteLeave` 或者`beforeRouteEnter`方法，记录离开页面的路由信息

#### 优点

- 仅在路由表里定义的组件会触发，且可以通过在 meta 里定义属性，做到精准控制对缓存的存取

#### 缺点

- 同样只适用于两级跳转的简单场景

####

### 方案三

`document.referrer`虽然不能做到获取`hash`，但是可以判断与当前页是否同源

结合思路二，将上一页的路由信息存在`session`

在确保项目内合理使用`push、replace`的情况下，通过`referrer`判断，如果上一页与当前页同源，直接调用 `router.back()`，`router.go(-1)`

否则`referrer`为空字符串，此时`replace`到缓存信息中的路由，

#### 优点

- 理论上体验会更好，可以保留浏览器的原生行为，在条件允许的情况下支持`back/forward Cache`，可以缓存浏览过的页面快照（包括 `JavaScript` 堆），使用 `bfcache` 恢复的重复访问总是比非 `bfcache` 导航更快
- 能够保证`history`栈的顺序，无论是使用 `push`还是 `replace` 回退，都会导致 `history` 栈不正确

#### 缺点

- 浏览器出于安全考虑，无法获取到真正完整的 `referrer` 地址，因此还是需要配合路由信息缓存

### 方案四

自行维护一个`history`栈

- [vue-navigation](https://github.com/zack24q/vue-navigation)
- [vue-page-stack](https://github.com/hezhongfeng/vue-page-stack)

以上两个库主要是针对`keep-alive`缓存页面，没有去存储上页的路由信息

#### 优点

- 维护了一个访问历史栈，与浏览器的 back/forward 同步
- 做了 keep-alive 缓存

#### 缺点

- 没有存储相关的路由信息，需要修改使用，取栈顶的 path 去路由表中匹配
- 没有对 back 行为做限制，可以结合 referrer
- 每次的 push/replace 都会触发对应的缓存存取操作

## 参考

- [referrer mdn](https://developer.mozilla.org/zh-CN/docs/Web/API/Document/referrer)
- [referrer 张鑫旭](https://www.zhangxinxu.com/wordpress/2017/02/js-page-url-document-referrer/)
- [http-referer 阮一峰](https://www.ruanyifeng.com/blog/2019/06/http-referer.html)
- [浏览器滚动保存行为 张鑫旭](https://www.zhangxinxu.com/wordpress/2022/05/history-scrollrestoration/)
- [stackoverflow 如何获取上一个 url](https://stackoverflow.com/questions/3528324/how-to-get-the-previous-url-in-javascript)
- [vuejs issue-面包屑](https://github.com/vuejs/vue-router/issues/3617)
- [stackoverflow 获取上一个页面的 url，包括 hash](https://stackoverflow.com/questions/36447977/how-to-get-previous-url-including-hash-fragment-using-javascript)
- [stackoverflow 在 react-router 中检测上一个路径](https://stackoverflow.com/questions/39288915/detect-previous-path-in-react-router)
- [谷歌开发者文档 back/forward 缓存](https://developer.chrome.com/docs/devtools/application/back-forward-cac)
- [谷歌开发者文档，请求头 referrer](https://developer.chrome.com/blog/referrer-policy-new-chrome-default/)
- [谷歌开发者文档 referer 最佳实践](https://web.dev/i18n/zh/referrer-best-practices/#%E8%B7%A8%E7%AB%99%E8%AF%B7%E6%B1%82%E4%BC%AA%E9%80%A0-csrf-%E4%BF%9D%E6%8A%A4)
- [永远不要使用 unload 事件](https://web.dev/bfcache/?utm_source=devtools#never-use-the-unload-event)
- [vue issue bfCache 失效](https://github.com/vuejs/vue/issues/8109)
- [next.js issue 讨论 一](https://github.com/vercel/next.js/issues/4136)
- [next.js issue 讨论 二](https://github.com/vercel/next.js/discussions/36723)
