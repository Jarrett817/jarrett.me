### 数据类型

- 写出下面运行的结果,解释原因

  ```javascript
  1 + '1';
  // 结果为11，数字与字符串相加，会把数字转为字符串，再相加
  'a' + +'b';
  // 结果为aNaN,+'b'结果为NaN，NaN与字符串相加，转为字符串，所以是aNaN
  ```

- 如何让 (a == 1 && a == 2 && a == 3) 的值为 true?

```js
let i = 1;
Number.prototype.valueOf = function () {
  return i++;
};
const a = new Number(1);
```

- 写出下面运行的结果,解释原因

  ```javascript
  function test(person) {
    person.age = 26;
    person = {
      name: '张三',
      age: 12
    };
    return person;
  }
  const p1 = {
    name: '李四',
    age: 19
  };
  const p2 = test(p1);
  console.log(p1);
  // -> {name:'张三',age:26}
  // 函数内复制了p1的副本到局部变量person，与p1指向同一个保存引用的堆内存地址，因此age被改为26
  console.log(p2);
  // -> {name:'李四',age:12}
  // 函数内部对person变量重新赋值，指向了新的堆内存地址，最后return出来的person是新赋值的person
  ```

- 实现两个大数相加

  ```javascript
  let a = '123456789012345678';
  let b = '876543210987654321';

  function add(a, b) {
    const maxLength = Math.max(a.length, b.length);
    a !== maxLength && (a = a.padStart(maxLength, 0));
    b !== maxLength && (b = b.padStart(maxLength, 0));
    let carryFlag = false,
      result = '';
    for (let i = maxLength - 1; i >= 0; i--) {
      let sum = parseInt(a[i]) + parseInt(b[i]);
      carryFlag && sum++ && (carryFlag = false);
      if (sum / 10 >= 1) {
        carryFlag = true;
        result = (sum % 10) + result;
      } else result = sum + result;
    }
    return carryFlag ? 1 + result : result;
  }
  add(a, b); // '999999999999999999'
  ```

- 手写类型判断函数

```javascript
function myTypeOf(params) {
  const res = Object.prototype.toString.call(params);
  return res.slice(1, -1).split(' ')[1].toLowerCase();
}
```

- 手写深拷贝函数

```js
function myTypeOf(params) {
  const res = Object.prototype.toString.call(params);
  return res.slice(1, -1).split(' ')[1].toLowerCase();
}
function forEach(ary, fn) {
  let index = 0;
  const length = ary.length;
  while (index < length) {
    fn(ary[index], index);
    index++;
  }
}

function deepClone(target, map = new WeakMap()) {
  if (['object', 'array'].includes(myTypeOf(target))) {
    const isObj = myTypeOf(target) === 'object';
    let result = isObj ? {} : [];
    if (map.get(target)) return map.get(target);
    map.set(target, result);
    const keys = isObj ? Object.keys(target) : target;
    forEach(keys, (value, key) => {
      if (isObj) key = value;
      result[key] = deepClone(target[key], map);
    });
    return result;
  } else return target;
}
```

### 作用域与闭包

1. 下面代码的输出结果

```js
var a = 20;

function foo() {
  if (!a) {
    a = 100;
  }

  var a = 10;

  return a;
}

console.log(foo());
```

解：输出为 10，因为 js 采用词法作用域，函数内部的作用域在函数定义时就确定了，优先查找并使用函数内部新创建的 a 变量

1. 以下代码在执行过程中是否存在闭包

```js
function outer() {
  var a = 1;

  function inner() {
    var b = 2;
    console.log(b);
  }

  return inner;
}

outer()();
```

解：不存在，虽然 inner 函数在 outer 函数的作用域链里，但是没有引用外部变量，未形成闭包

1. 以下变种代码是否存在闭包，并且说出 inner 函数执行时的作用域链

```diff
function outer() {
  var a = 1;

  function inner() {
    var b = 2;
-    console.log(b);
+    console.log(a);
  }

  return inner;
}

outer()();
```

解：存在，inner 函数的 scopeChain:[inner,outer,global]

1. 以下代码是否存在闭包

```js
function outer() {
  var a = 1;

  function inner() {
    console.log(a);
  }

  inner();
}

outer();
```

解：存在，内部 inner 函数引用了其外部作用域链上的变量，形成闭包，但由于没有 return 出来，在执行完毕后，闭包会被回收

### 原型链

- 手动实现 new 函数

```js
function New(func) {
  // 创建一个中间对象实例
  const res = {};
  // 将实例的原型指向构造函数的原型
  if (func.prototype !== null) {
    res.__proto__ = func.prototype;
  }
  // 将构造函数的this指向新创建的中间对象
  const ret = func.apply(res, Array.prototype.slice.call(arguments, 1));

  // 如果构造函数有明确指定返回对象，当返回结果类型是object或者function时，返回对象，否则返回指定的结果
  if ((typeof ret === 'object' || typeof ret === 'function') && ret !== null) {
    return ret;
  }
  return res;
}
```

- 手动实现 `instanceof` 的功能

```js
function myInstanceof(instance, target) {
  const instanceProto = instance.__proto__,
    targetProto = target.prototype;
  if (!instanceProto) return false;
  if (instanceProto === targetProto) return true;
  else return myInstanceof(instanceProto, target);
}
```

### this、闭包

- 写出下面运行的结果

  ```javascript
  var name = 'window';
  var person1 = {
    name: 'person1',
    foo1: function () {
      console.log(this.name);
    },
    foo2: () => console.log(this.name),
    foo3: function () {
      return function () {
        console.log(this.name);
      };
    },
    foo4: function () {
      return () => {
        console.log(this.name);
      };
    }
  };
  var person2 = { name: 'person2' };

  person1.foo1(); // 'person1'，this指向调用foo1的person1
  person1.foo1.call(person2); // 'person2'，通过call指定foo1的this为person2

  person1.foo2(); // 'window'，箭头函数的this由所在的作用域决定，var person不会创建作用域，因此指向全局作用域window
  person1.foo2.call(person2); // 'window'，箭头函数的this在声明时就已经确定，无法被call、apply改变

  person1.foo3()(); // 'window'，person1.foo3()返回了内部函数，调用时是在全局作用域
  person1.foo3.call(person2)(); // 'window'，内部函数的调用依然是在全局作用域
  person1.foo3().call(person2); // 'person2'，改变了内部函数的this

  person1.foo4()(); // 'person1'，内部箭头函数的this即foo4的作用域的this
  person1.foo4.call(person2)(); // 'person2'，改变了foo4的this
  person1.foo4().call(person2); // 'person1'，箭头函数不会被改变this
  ```

- 写出下面运行的结果

  ```javascript
  var name = 'window';
  function Person(name) {
    this.name = name;
    this.foo1 = function () {
      console.log(this.name);
    };
    this.foo2 = () => console.log(this.name);
    this.foo3 = function () {
      return function () {
        console.log(this.name);
      };
    };
    this.foo4 = function () {
      return () => {
        console.log(this.name);
      };
    };
  }
  var person1 = new Person('person1');
  var person2 = new Person('person2');

  person1.foo1(); // 'person1'，构造函数的this指向实例对象
  person1.foo1.call(person2); // 'person2'，改变this指向

  person1.foo2(); // 'person1'，箭头函数的this声明时已确定，指向实例
  person1.foo2.call(person2); // 'person1'，箭头函数不会被call改变this

  person1.foo3()(); // 'window'，内部函数先返回再执行，this指向window
  person1.foo3.call(person2)(); // 'window'，函数的this在被调用时确定，先返回了函数，再执行，指向window
  person1.foo3().call(person2); // 'person2'，指定了内部函数的this

  person1.foo4()(); // 'person1'，内部箭头函数的this即foo4的this，指向实例
  person1.foo4.call(person2)(); // 'person2'，指定的foo4的this即内部箭头函数的this
  person1.foo4().call(person2); // 'person1'，无法指定箭头函数的this
  ```

- 写出下面运行的结果

  ```javascript
  function foo() {
    var myName = '章三';
    let test1 = 1;
    const test2 = 2;
    var innerBar = {
      getName: function () {
        console.log(test1);
        return myName;
      },
      setName: function (newName) {
        myName = newName;
      }
    };
    return innerBar;
  }
  var bar = foo();
  bar.setName('李四');
  bar.getName(); // 1
  console.log(bar.getName()); // 1 '李四'，存在闭包
  ```

### 事件循环

注意点：
1、`promise.then` 会将状态持续传递下去，除非抛出错误或者 `return` 了 `Promise.reject`
2、没有显示返回值的函数默认返回 `undefined`，这同样会将`.then` 返回的 `promise` 状态置为 `fulfilled`,同样能将`.then`中的回调放入微任务队列
3、同步任务优先、异步任务挂起，处理顺序根据任务队列情况而定，宏任务优先级低，只有微任务队列清空才会去拿一个宏任务出来执行
4、PromiseA+规定当 then 中参数不为函数时，必须忽略，表现在.then 中，会原样返回 promise 结果

- 写出下面运行的结果

  ```javascript
  Promise.resolve(console.log(0))
    .then(() => {
      console.log(1);
      Promise.resolve(console.log(5))
        .then(() => console.log(3))
        .then(() => console.log(4))
        .then(() => console.log(6));
    })
    .then(() => console.log(2))
    .then(() => console.log(7));

  // 0、1、5、3、2、4、7、6
  /* 
  script开始
  第一行的resolve同步执行 log 0，然后主线程直接执行到后续的第一个then，其中的回调直接放入微任务队列
  此时script中同步任务执行完毕，主线程空闲，开始处理微任务，log 1
  同步执行Promise.resolve,log 5，.then，当前上下文中同步任务执行完毕，将log 3 放入微任务队列，任务挂起
  此时当前上下文中同步任务执行完毕，没有显式返回，相当于resolve，执行外层第二个.then，把log 2 放入微任务队列，任务挂起，此时没有同步任务，主线程去执行微任务队列，log 3
  执行完后，return undefined，将后面log 4放入微任务队列，任务挂起
  没有同步任务，主线程去处理微任务，log 2，执行完成后return undefined，将后面log 7放入微任务
  没有同步任务，主线程去处理微任务，log 4，完成后返回undefined，将后面log 6放入微任务队列，任务挂起
  没有同步任务，主线程去处理微任务，log 7
  现在只剩下微任务队列里还剩一个log 6，执行log 6
  */
  ```

- 写出下面运行的结果

  ```javascript
  const first = () =>
    new Promise((resolve, reject) => {
      console.log(3);
      let p = new Promise((resolve, reject) => {
        console.log(7);
        setTimeout(() => {
          console.log(5);
          resolve(6);
          console.log(p);
        }, 0);
        resolve(1);
      });
      resolve(2);
      p.then(arg => {
        console.log(arg);
      });
    });
  first().then(arg => {
    console.log(arg);
  });
  console.log(4);

  // 3、7、4、1、2、5、promise<fulfilled，1>
  /*
   script开始
   执行first函数，同步执行log 3
   同步执行new Promise，log 7，setTimeout将回调分发至宏任务队列，任务挂起，主线程往下执行resolve(1)
   log 1进入微任务队列
   执行resolve(2)，log 2 放入微任务队列
   同步执行p.then挂起，执行first后面的.then 挂起
   主线程同步执行log 4，同步任务执行完毕
   执行微任务队列，依次log 1、log 2
   微任务全部执行完毕，拿一个宏任务出来执行，log 5
   下一步resolve 6 没用，Promise A+ 中说明不可改变已经处理完毕的promise状态
   最后一步log p，是一个已经被置为fulfilled的promise
  */
  ```

- 写出下面运行的结果

  ```javascript
  const async1 = async () => {
    console.log('async1');
    setTimeout(() => {
      console.log('timer1');
    }, 2000);
    await new Promise(resolve => {
      console.log('promise1');
    });
    console.log('async1 end');
    return 'async1 success';
  };
  console.log('script start');
  async1().then(res => console.log(res));
  console.log('script end');
  Promise.resolve(1)
    .then(2)
    .then(Promise.resolve(3))
    .catch(4)
    .then(res => console.log(res));
  setTimeout(() => {
    console.log('timer2');
  }, 1000);
  // script start、async1、promise1、script end、1、timer2、timer1
  /* 
  同步执行script start
  执行 async1，log async1
  setTimeout 放入宏任务队列，异步任务挂起，执行下一个 new Promise，log promise1,没有resolve，挂起
  后续的log async1 success和script end其实是在.then中，但是这个promise没有被resolve，不会放入微任务队列，不会执行后续代码
  执行async1后的.then，放入微任务队列，挂起，执行log script end
  执行Promise.resolve(1).then ，不是函数，忽略，下一步.then执行，参数不是函数，忽略,catch(4)不是函数，忽略
  下一步执行.then，放入log res 放入微任务队列（即log 1）
  执行setTimeout，放入宏任务队列，挂起，主线程处理微任务，log 1
  最后依次执行宏任务队列，根据等待时间的快慢，log timer2、timer 1 
  */
  ```

- 写出下面运行的结果

  ```javascript
  const p1 = new Promise(resolve => {
    setTimeout(() => {
      resolve('resolve3');
      console.log('timer1');
    }, 0);
    resolve('resolve1');
    resolve('resolve2');
  })
    .then(res => {
      console.log(res);
      setTimeout(() => {
        console.log(p1);
      }, 1000);
    })
    .finally(res => {
      console.log('finally', res);
    });
  // resolve1、finally,undefined、timer1、promise<fulfilled,undefined>
  /*
    执行new Promise，setTimeout放入宏任务队列
    resolve1放入微任务队列
    resolve2放入微任务队列
    任务挂起，执行.then,挂起
    无同步任务，执行微任务队列，log resolve1，resolve2没用
    setTimeout放入宏任务队列
    无同步任务，执行.finally，放入微任务队列，挂起
    无同步任务，执行微任务队列，log finally，undefined，因为上一个.then没有return，函数默认return undefined
    微任务执行完毕，执行宏任务队列，log timer1、promise<fulfilled,undefined>
  */
  ```

### 异步编程

1. 实现 sleep 函数，在 n 毫秒之后执行函数，并以函数结果作为返回值(可用 ts 来写)

```js
function sleep(fn, time) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(fn());
    }, time);
  });
}

sleep(() => {
  return '执行';
}, 3000).then(res => console.log(res));
```

2. 实现 Promise.retry

   ```js
   /**
    * 实现 Promise.retry，重试异步函数
    * 异步函数执行成功后 resolve 结果，
    * 失败后重试，尝试超过一定次数才真正的 reject
    */
   Promise.retry = function (fn, chance = 1) {
     return new Promise(async (resolve, reject) => {
       while (chance--) {
         try {
           resolve(await fn());
         } catch (err) {
           !chance && reject(err);
         }
       }
     });
   };

   function doSomething() {
     return new Promise((res, reje) => {
       setTimeout(() => {
         reje(1);
       }, 1000);
     });
   }

   Promise.retry(doSomething, 3)
     .then(res => console.log('success,res'))
     .catch(err => console.log('error', err));
   ```

3. 手写 promise，使用[promises-aplus-tests](https://github.com/promises-aplus/promises-tests) 进行测试

```

```

1. 信号灯控制器
   用异步编程的方式实现一个信号灯（交通灯）控制器，要求：

   - 红灯亮 50 秒
   - 绿灯亮 60 秒
   - 黄灯亮 10 秒
   - 次序为 红-绿-黄-红-绿-黄

   ```javascript
   function red() {
     console.log('red');
   }
   function green() {
     console.log('green');
   }
   function yellow() {
     console.log('yellow');
   }
   // TODO

   function red() {
     console.log('red shining');
   }
   function green() {
     console.log('green shining');
   }
   function yellow() {
     console.log('yellow shining');
   }
   ```

```js
class TrafficLight {
  promisedLights = [];
  stopSignal = false;
  constructor(lights) {
    this.promisedLights = lights.map(({ lighting, duration, color }) => {
      return () =>
        new Promise((resolve, reject) => {
          console.log(`${color} start!`);
          lighting();
          setTimeout(() => {
            if (!this.stopSignal) {
              console.log(`${color} end!`);
              resolve();
            }
          }, duration);
        });
    });
  }

  async start() {
    while (this.promisedLights.length) {
      if (this.stopSignal) {
        this.promisedLights = [];
        break;
      }
      const light = this.promisedLights.shift();
      light && (await light());
      this.promisedLights.push(light);
      continue;
    }
  }

  stop() {
    this.stopSignal = true;
  }
}

const lights = [
  { duration: 5000, lighting: red, color: 'red' },
  { duration: 6000, lighting: green, color: 'green' },
  { duration: 1000, lighting: yellow, color: 'yellow' }
];

const trafficLight = new TrafficLight(lights);

trafficLight.start();

setTimeout(() => trafficLight.stop(), 100000);
```

2. 实现一个带并发限制的异步调度器 Scheduler，保证同时运行的任务最多有两个

```javascript
const scheduler = new Scheduler(2);
scheduler.addTask(1, '1'); // 1s后输出’1'
scheduler.addTask(2, '2'); // 2s后输出’2'
scheduler.addTask(1, '3'); // 2s后输出’3'
scheduler.addTask(1, '4'); // 3s后输出’4'
scheduler.start();
```

```js
class Scheduler {
  limit = 2;
  taskQueue = [];
  count = 0;
  constructor(limit) {
    this.limit = limit;
    this.taskQueue = [];
  }

  addTask(time, value) {
    this.taskQueue.push(
      () =>
        new Promise((resolve, reject) => {
          setTimeout(() => {
            console.log(value, new Date().getSeconds());
            resolve();
          }, time * 1000);
        })
    );
  }

  start() {
    if (this.count < this.limit && this.taskQueue.length) {
      const promiseTask = this.taskQueue.shift();
      this.count++;
      promiseTask().then(() => {
        this.count--;
        this.start();
      });
      if (this.count < this.limit) this.start();
    }
  }
}

const scheduler = new Scheduler(2);
scheduler.addTask(1, '1'); // 1s后输出’1'
scheduler.addTask(2, '2'); // 2s后输出’2'
scheduler.addTask(1, '3'); // 2s后输出’3'
scheduler.addTask(1, '4'); // 3s后输出’4'
console.log('start', new Date().getSeconds());

scheduler.start();
```
