# 手写 promise

## promise 基本特征

1. 有三个状态：pengding、fullfilled、rejected
2. new Promise 时，需要传递一个回调，立即执行
3. 回调接受两个参数，resolve 和 reject
4. 默认状态是 pending
5. promise 有一个 value 保存成功状态的值，可以是 undefined、thenable、promise
6. promise 有一个 reason 保存失败状态的值
7. promise 智能从 pending 到 rejected 或者 fullfilled，状态一旦确认就不会再改变
8. promise 必须有一个 then 方法，接受两个参数，分别是成功的回调 onFulfilled 和失败的回调 onRejected
9. 如果调用 then，promise 已经成功，则执行 onFullfilled，参数是 promise 的 value
10. 如果调用 then，promise 已经失败，调用 onRejected，参数是 promise 的 reason
11. 如果 then 抛出异常，那么就把异常作为参数，传给下一个 then 的失败的回调 onRejected
12. then的参数onFulfilled和onRejected可以缺省，如果不是函数，就忽略，且依旧可以在下面的then中获取到之前返回的值
13. promise可以then多次，每次都返回新的promise
14. 如果promise返回一个普通值，就把这个结果作为参数，传递给下一个then的成功回调
15. 如果promise抛出异常，那么这个异常作为参数传递给下一个then的失败回调
16. 如果返回一个promise，会等这个promise执行完，如果成功就走下个then，如果失败或者抛出异常就走下个的失败
17. 如果then的返回值和promise是同一个引用对象，造成循环引用，那就抛出异常
18. 如果then的返回值是一个promise，且x同时调用resolve和reject，第一个调用优先，状态不会再次被改变

<<< ./promise/index.js


## promise的方法实现

```js
static resolve(data){
  if(data instanceof Promise){

  }

}

```