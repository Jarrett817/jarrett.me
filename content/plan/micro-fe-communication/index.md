# 微前端架构下的主子通信

## 背景

微前端架构下的应用之间仍然存在交互场景，并非完全无关

- 子应用控制主应用的登出
- 子应用需要知晓主应用的一些全局性操作如全局性的路由跳转
- 子应用之间存在互相跳转的情况，写死的 url 在项目的持续性维护中存在问题

需要一套更普适的方法

## 微前端通信方式调研

### umi/qiankun、single-spa

通过监听 url change 事件，在路由变化时匹配到渲染的子应用并进行渲染，这个思路也是目前实现微前端的主流方式，对于应用间的跳转是通过路由库的方式

qiankun 官方对于跳转的回应是：在主子都是 hash 模式时，直接跳转；在主子都是 history 模式时，使用 history.pushState（不推荐、会触发所有应用的路由监听） 或者主应用下发路由实例的方式跳转

因此在 qiankun 中，**props 下发** 是较为推荐的通信方式

qiankun 提供了两种方式：

1. props 直接下发
2. initGlobalState

```js
// 主应用：
import { initGlobalState, MicroAppStateActions } from 'qiankun';

// 初始化 state
const actions: MicroAppStateActions = initGlobalState(state);

actions.onGlobalStateChange((state, prev) => {
  // state: 变更后的状态; prev 变更前的状态
  console.log(state, prev);
});
actions.setGlobalState(state);
actions.offGlobalStateChange();

//微应用：
// 从生命周期 mount 中获取通信方法，使用方式和 master 一致
export function mount(props) {
  props.onGlobalStateChange((state, prev) => {
    // state: 变更后的状态; prev 变更前的状态
    console.log(state, prev);
  });

  props.setGlobalState(state);
}
```

### 腾讯/wujie

webcomponents + iframe 的方式

- props 注入机制
  子应用通过$wujie.props 可以轻松拿到主应用注入的数据

```js
// 主应用可以通过props注入数据和方法：
<WujieVue name="xxx" url="xxx" :props="{ data: xxx, methods: xxx }"></WujieVue>


// 子应用可以通过$wujie来获取：
const props = window.$wujie?.props; // {data: xxx, methods: xxx}
```

- window.parent 通信机制
  子应用 iframe 沙箱和主应用同源，子应用可以直接通过 window.parent 和主应用通信

```js
// 主应用调用子应用的全局数据
window.document.querySelector('iframe[name=子应用id]').contentWindow.xxx;

// 子应用调用主应用的全局数据
window.parent.xxx;
```

- 去中心化的通信机制
  无界提供了 EventBus 实例，注入到主应用和子应用，所有的应用可以去中心化的进行通信

```js
// 主应用使用方式:

// 如果使用wujie
import { bus } from "wujie";

// 如果使用wujie-vue
import WujieVue from "wujie-vue";
const { bus } = WujieVue;

// 如果使用wujie-react
import WujieReact from "wujie-react";
const { bus } = WujieReact;

// 主应用监听事件
bus.$on("事件名字", function (arg1, arg2, ...) {});
// 主应用发送事件
bus.$emit("事件名字", arg1, arg2, ...);
// 主应用取消事件监听
bus.$off("事件名字", function (arg1, arg2, ...) {});

// 子应用使用方式:
// 子应用监听事件
window.$wujie?.bus.$on("事件名字", function (arg1, arg2, ...) {});
// 子应用发送事件
window.$wujie?.bus.$emit("事件名字", arg1, arg2, ...);
// 子应用取消事件监听
window.$wujie?.bus.$off("事件名字", function (arg1, arg2, ...) {});

```

### 京东/micro-app

webcomponents 的思路

- history.pushState 结合主动触发 popState 事件

```js
window.history.pushState(null, '', 'page2'); // history
window.history.pushState(null, '', '#/page2'); // hash

// 主动触发一次popstate事件
window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
```

:::warning
不推荐

1、popstate 事件是全局发送的，所有正在运行的应用都会接受到新的路由地址并进行匹配，要防止兜底到应用的 404 页面。

2、window.history 并非适用于所有场景，一些框架如 vue-router4，angular 会出现问题，此时建议使用下面的方式 2、3。
:::

- 数据通信控制跳转

```js
// 子应用中监听数据变化;

// 监听基座下发的数据变化
window.microApp.addDataListener(data => {
  // 当基座下发跳转指令时进行跳转
  if (data.path) {
    router.push(data.path);
  }
});

// 基座下发跳转指令;

import microApp from '@micro-zoe/micro-app';

microApp.setData('子应用name', { path: '/new-path/' });
```

- 传递路由实例

主应用下发跳转函数

### 字节/garfish

- 提供了类似的 EventBus 机制 `Garfish.channel`

### 阿里/icestack

- 全局 `store`

```js
// 主应用
import { store } from '@ice/stark-data';

const userInfo = { name: 'Tom', age: 18 };
store.set('language', 'CH'); // 设置语言
store.set('user', userInfo); // 设置登录后当前用户信息
setTimeout(() => {
  store.set('language', 'EN');
}, 3000);

// 微应用
import { store } from '@ice/stark-data';

// 监听语言变化
store.on(
  'language',
  lang => {
    console.log(`current language is ${lang}`);
  },
  true
);

// 获取当前用户
const userInfo = store.get('user');
```

- EventBus

```js
// 主应用
import { event } from '@ice/stark-data';

event.on('freshMessage', () => {
  // 重新获取消息数
});

// 微应用
import { event } from '@ice/stark-data';

event.emit('freshMessage');
```

- props

props 注入

### 小结

经调研，业界微前端主流的方案有以下两种

1. EventBus
2. props

## 业务场景列举

- 主应用跳子应用
- 子应用跳子应用，项目内跳转、新开浏览器 tab 页
- 子应用跳主应用，退出登陆等
- 主应用切换子应用，子应用监听到切换与被切换是同步进行的，无法做一些流程上的控制

## 方案

### 方案一

`props` 下发数据 + `window` 上的自定义事件
脱离微前端本身的 `eventBus` 的方式，通过监听与触发事件来实现通信

#### 优点

- 实现简单，框架无关
- 非常容易实现子应用间，主子应用间的通信
- 主子完全解耦

#### 缺点

- 仅仅是一个通知，不方便做一些流程上的控制，如子应用在被切换前的异步行为
- 实际业务使用中，仍然需要结合 `props` 下发的数据，且代码编写上是分散的，增加维护成本
- 当多个子应用同时存在，并且监听同个事件时，可能会导致意想不到的问题
- 如使用了 `window` 上的自定义事件，需要及时手动销毁监听

### 方案二

下发 `eventBus` 实例 + 数据

例如 `qiankun` 提供了 `initGlobalState`，内含有对于 `state` 数据的监听和 `set` 操作

#### 优点

- 使用更明确，统一了入口，便于维护
- 框架本身提供的功能，稳定性好
- `qiankun`、`icestack` 下发类似 `eventBus` 的实例直接提供了数据监听的方式，无需另外去了解事件触发的方式，api 更精简，心智负担更小

#### 缺点

- 框架本身提供的方式，有业务局限性，如`qiankun` 的 `initGlobalState`，并未提供数据获取的 `get` 操作
- 下发的方式导致主子有一定程度的耦合

### 方案三

对于需要暴露给子应用的数据，额外 `new` 一个包括了 `mutation`、`action`、`state` 的完整 `vuex` 实例下发给子应用

#### 优点

- 更多的场景适配，`props` 可以在微前端各个生命周期获取，能够方便做一些针对性的流程控制，比如在项目切换时，子应用根据 `props` 判断是否需要在卸载前跳转某个指定页面
- 对于子应用来说，具有更强的主观能动性，而不是被动的等待主应用通知
- 子应用无需手动销毁事件监听，例如下发的是 `store` 的实例，应用销毁时同步销毁实例即可
- 对于已经使用 `vue` 生态的项目，心智负担最小

#### 缺点

- 下发的方式导致主子有一定程度的耦合
- 微前端通信需要的只是数据的 `get`、`set` 和方法的调用，`vuex` 有些重

### 方案四

参考上述 `icestack` 的通信方式，结合方案三，另外维护一个包，主子通过直接引入包

`@ice/stark-data` 这个包是将数据通过命名空间存在`window`对象里，非持久（可以考虑结合`sessionStorage`、`localStorage`）

可以维护一个类似的库满足业务需求

#### 优点

- 主子不强耦合
- 使用方便
- 支持按需引入

#### 缺点

- 需要额外维护一个包，有一定的开发成本
- `sessionStorage`、`localStorage` 的存储大小有限，需要斟酌存储的数据量

## 结论

综上所述，可以考虑下发一个 store 或者单独维护一个具备状态管理功能的包来处理微前端的通信问题

## 参考

- [qiankun issue 讨论：传递 vue store](https://github.com/umijs/qiankun/issues/566)
- [umi/qiankun](https://qiankun.umijs.org/zh/api#initglobalstatestate)
- [京东/micro-app](https://zeroing.jd.com/docs.html#/zh-cn/jump)
- [腾讯/wujie](https://wujie-micro.github.io/doc/guide/communication.html)
- [字节/garfish](https://www.garfishjs.org/api/channel)
- [阿里/icestack](https://micro-frontends.ice.work/docs/guide/advanced/communication)
