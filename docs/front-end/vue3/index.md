# vue3

## Vue2 和 Vue3 的区别

除了 api 和使用上的变化之外，主要有如下几点

1. 响应式的变化

   - 借助 proxy，实现更精细的响应式转换，比起 vue2 需要对对象进行深度遍历，vue3 只会将 get 到的对象属性进行包装，并且能够拦截新增的对象属性
   - 可选的响应式转换，对于渲染函数中的变量传递更为自由，可以直接 return js 变量使用，省去了多余的响应式包装

2. diff 算法
   - vue2 双端 diff 算法。vue3 双端对比 + 最长递增子序列
3. 模版编译优化
   - 更改了编译优化策略。vue2 会标记静态节点和静态根节点，vue3 以 patchFlag 区分不同类型的动态节点，以 block 为维度收集子级树中所有的动态节点，更新时跳过所有静态节点直接更新动态节点，并且得益于 patchFlag 的区分，能做到精准的靶向更新
   - 静态提升。把生成的静态的子树或者静态 prop 提升到渲染函数之外，只持有引用
4. 组合式 api
   - 利于 tree shaking，可以结合使用特性开关去掉 options api，只使用 composition api，进一步减少打包体积
   - 比起 vue2 将所有东西都挂在 this 上，很多时候只能靠 mixin 复用逻辑，hook 的写法更方便逻辑复用，且更加类型友好
5. 自定义渲染器
   - vue3 开放了自定义渲染器的接口 createRenderer，可以非常方便的实现自定义渲染逻辑，使用场景更广
6. 新增了 Fragment vNode 类型，允许多根节点模版

## 为什么要使用 composition api

### mixin、高阶组件（HOC）、renderLess components（插槽） 存在的问题

- 模版中的数据来源不清晰
- 命名冲突
- 性能。高阶组件、renderLess components 都需要额外的组件实例来封装逻辑

### composition api 的优势

- TS 对函数参数、返回值和泛型的支持比较完善
- 每一个函数都可以都可以单独引入，且代码压缩效率更高（所有的函数名和 setup 函数体内部的变量名都可以被压缩，但对象和 class 的属性/方法名却不可以），tree-shaking 友好
- 更好的逻辑复用、更灵活的代码组织

![](./images/conposition-api.png)

### 实际应用

```shell
todoList
|____index.vue
|____hooks
| |____useDataList.js
| |____useLiEvent.js
```

```js
import { customRef } from 'vue';

export function useDebouncedRef(value, delay = 200) {
  let timeout;
  return customRef((track, trigger) => {
    return {
      get() {
        track();
        return value;
      },
      set(newValue) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          value = newValue;
          trigger();
        }, delay);
      }
    };
  });
}
```

```vue
<script setup>
import { useDebouncedRef } from './debouncedRef';
const text = useDebouncedRef('hello');
</script>

<template>
  <input v-model="text" />
</template>
```

- [Vue Function-based API RFC](https://zhuanlan.zhihu.com/p/68477600)
- [hook 示例](https://github.com/antfu/vueuse/blob/main/packages/core/useNow/index.ts)
- [awesome-vue3](https://github.com/vuesomedev/awesome-vue-3)
- [和 React Hooks 的对比](https://cn.vuejs.org/guide/extras/composition-api-faq.html#comparison-with-react-hooks)

## 常见 composition api 原理

```js
import { ref, watchEffect } from 'vue';

const count = ref(0);

watchEffect(() => {
  document.body.innerHTML = `计数：${count.value}`; // 执行某个行为，比如更新视图
});

// 更新 DOM
count.value++;
```

getter、setter，以及依赖的收集和追踪

```js
function createGetter(isReadonly = false, shallow = false) {
  return function get(target, key) {
    const res = Reflect.get(target, key);
    if (shallow) return res;
    if (isRef(res)) return res.value;
    // 对于嵌套的对象进行响应式处理
    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res);
    }
    !isReadonly && track(target, key);
    return res;
  };
}

function createSetter() {
  return function set(target, key, value) {
    const res = Reflect.set(target, key, value);
    // 触发依赖
    trigger(target, key);
    return res;
  };
}

let activeEffect;
let targetMap = new WeakMap();

function track(target, key) {
  if (activeEffect) {
    const effects = getSubscribersForProperty(target, key);
    effects.add(activeEffect);
  }
}

function trigger(target, key) {
  const effects = getSubscribersForProperty(target, key);
  effects.forEach(effect => effect());
}
```

基于上述，我们可以实现一系列的响应式 api

```js
function reactive(target) {
  if (isReadonly(target)) return target;
  return new Proxy(target, {
    get: createGetter(),
    set: createSetter()
  });
}

function shallowReactive(target) {
  return new Proxy(target, {
    get: createGetter(false, true),
    set: createSetter()
  });
}

function ref(value) {
  const refObject = {
    get value() {
      track(refObject, 'value');
      return value;
    },
    set value(newValue) {
      value = newValue;
      trigger(refObject, 'value');
    }
  };
  return refObject;
}

// function readonlySet(target, key, value) {
//   console.warn(`key:${key}set失败，因为 target 是 readonly`, target);
//   return true;
// }

function readonly(target) {
  return new Proxy(target, {
    get: createGetter(true),
    set: readonlySet
  });
}

function shallowReadonly() {
  return new Proxy(target, {
    get: createGetter(true, true),
    set: readonlySet
  });
}
```

实现了依赖的收集和触发，我们还需要实现一个副作用函数的注册机制
最终的目的是实现 **数据变更->触发副作用函数**

```js
let activeEffect;

class ReactiveEffect {
  private _fn;
  active = true;
  constructor(fn, public scheduler) {
    this._fn = fn;
  }
  run() {
    if (!this.active) return this._fn();
    shouldTrack = true;
    activeEffect = this;
    // 在执行this.fn的时候，fn里所用到的reactive变量，会将本对象作为依赖收集
    const result = this._fn();
    // 已经收集好依赖了，将shouldTrack置为false，表明在这个fn中所用到的reactive变量都已完成依赖收集
    // 不会再有另外的reactive变量以此为依赖了，因此关闭掉
    shouldTrack = false;
    return result;
  }

  stop() {
    if (this.active) {
      cleanupEffect(this);
      this.active = false;
      shouldTrack = false;
    }
  }
}


```

ReactiveEffect 封装了副作用函数的注册机制

由此可以封装出以下 api

```js
function effect(fn, options) {
  const _effect = new ReactiveEffect(fn, options.scheduler);
  _effect.run();
  return runner;
}

function watchEffect(update) {
  effect(update);
}

function computed(getter) {
  let dirty = true;
  const effect = new ReactiveEffect(getter, () => {
    if (!dirty) {
      dirty = true;
    }
  });
  let value;
  return {
    get value() {
      if (dirty) {
        dirty = false;
        // 只在执行get时才去run
        value = this._effect.run();
      }
      return value;
    }
  };
}
```

## 为什么需要包装对象

函数直接返回一个原始值，如 number、string，是无法追踪变化的

包装对象的意义就在于提供一个让我们能够在函数之间以引用的方式传递任意类型值的容器

但不同的是 Vue 的包装对象同时还是响应式的数据源。有了这样的容器，我们就可以在封装了逻辑的组合函数中将状态以引用的方式传回给组件。组件负责展示（追踪依赖），组合函数负责管理状态（触发更新）

- (响应性语法糖（已废弃）)[https://cn.vuejs.org/guide/reactivity-transform.html]

## 什么是副作用函数

_会产生副作用的函数_

```js
// effect函数的执行会直接或间接影响其他函数的执行
let a = 1;
function effect() {
  document.body.innerText = 'hello vue3';
  a = 2; // 修改了全局变量也是一个副作用
}
```

## 为什么使用 Proxy

真正的拦截

- 无需`$set`动态添加对象属性
- 无需 hack 数组方法
- 无需深度遍历，惰性响应式转换

## Proxy 的原理

ECMAScript 规范里将对象分为两种，一种叫常规对象，一种叫异质对象。

对象有各种内部方法比如`[[Get]]`、`[[Call]]`、`[[Construct]]`。他们有对应的规定实现，所有步符合规定实现的对象都是异质对象，由于 Proxy 的内部方法`[[Get]]`没有使用 ECMA 的规范实现（方法具有多态性），所以 Proxy 是异质对象。

正是由于 Proxy 的`[[Get]]`方法实现了不同的逻辑，才能够拦截操作。如果创建代理对象时没有指定拦截函数，代理对象的`[[Get]]`方法会调用原始对象的内部方法`[[Get]]`来获取属性值，这其实就是代理透明性质。

## 为什么使用 reflect api

```js
const obj = {
  foo: 1,
  get bar() {
    return this.foo;
  }
};

const p = new Proxy(obj, {
  get(target, key) {
    return target[key];
  }
});
```

调用 p.bar 时，this 指向 obj，相当于 obj.foo，通过原始对象访问它的某个属性值是不会建立联系的，而 Reflect.get 的第三个参数 receiver 很好的解决了这个问题。receiver 是 Proxy 或者继承 Proxy 的对象，能够避免上述使用原始对象的问题

```js
const p = new Proxy(obj, {
  get(target, key, receiver) {
    console.log(target, key, receiver);
    return Reflect.get(target, key, receiver);
  }
});
```

<!--@include: ./diff.md-->
