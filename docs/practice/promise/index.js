const PENDING = 'PENDING',
  FULFILLED = 'FULFILLED',
  REJECTED = 'REJECTED';

const resolvePromise = (promise, x, resolve, reject) => {
  if (promise === x) return reject(new TypeError('Chaining cycle detected for promise #<Promise>'));

  let called = false;
  if ((typeof x === 'object' && x !== null) || typeof x === 'function') {
    try {
      let then = x.then;
      if (typeof then === 'function') {
        then.call(
          x,
          y => {
            if (called) return;
            called = true;
            resolvePromise(promise, y, resolve, reject);
          },
          r => {
            if (called) return;
            called = true;
            reject(r);
          }
        );
      } else {
        resolve(x);
      }
    } catch (e) {
      if (called) return;
      called = true;
      reject(e);
    }
  } else {
    resolve(x);
  }
};

class MyPromise {
  constructor(executor) {
    this.status = PENDING;
    this.value = undefined;
    this.reason = undefined;
    this.onResolvedCallbacks = [];
    this.onRejectedCallbacks = [];

    let resolve = value => {
      if (this.status === PENDING) {
        this.status = FULFILLED;
        this.value = value;
        this.onResolvedCallbacks.forEach(fn => fn());
      }
    };
    let reject = reason => {
      if (this.status === PENDING) {
        this.status = REJECTED;
        this.reason = reason;
        this.onRejectedCallbacks.forEach(fn => fn());
      }
    };

    try {
      executor(resolve, reject);
    } catch (e) {
      reject(e);
    }
  }

  static resolve(value) {
    if (value instanceof Promise) {
      return value;
    } else {
      return new MyPromise((resolve, reject) => {
        resolve(value);
      });
    }
  }

  static reject(reason) {
    return new MyPromise((resolve, reject) => reject(reason));
  }

  then(onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : v => v;
    onRejected =
      typeof onRejected === 'function'
        ? onRejected
        : err => {
            throw err;
          };

    let promise = new MyPromise((resolve, reject) => {
      if (this.status === FULFILLED) {
        setTimeout(() => {
          try {
            const x = onFulfilled(this.value);
            resolvePromise(promise, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        }, 0);
      }

      if (this.status === REJECTED) {
        setTimeout(() => {
          try {
            const x = onRejected(this.reason);
            resolvePromise(promise, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        }, 0);
      }

      if (this.status === PENDING) {
        this.onResolvedCallbacks.push(() => {
          setTimeout(() => {
            try {
              const x = onFulfilled(this.value);
              resolvePromise(promise, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          }, 0);
        });
        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              const x = onRejected(this.reason);
              resolvePromise(promise, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          }, 0);
        });
      }
    });
    return promise;
  }
}

MyPromise.prototype.catch = function (cb) {
  return this.then(null, cb);
};

MyPromise.prototype.finally = function (cb) {
  return this.then(
    value => {
      return MyPromise.resolve(cb()).then(() => value);
    },
    reason => {
      return MyPromise.resolve(cb()).then(() => {
        throw reason;
      });
    }
  );
};

MyPromise.all = function (values) {
  if (!Array.isArray(values)) {
    const type = typeof values;
    return new TypeError(`TypeError: ${type} ${values} is not iterable`);
  }

  return new MyPromise((resolve, reject) => {
    let resultArr = [];
    let orderIndex = 0;
    const processResultByKey = (value, index) => {
      resultArr[index] = value;
      if (++orderIndex === values.length) {
        resolve(resultArr);
      }
    };

    for (let i = 0; i < values.length; i++) {
      let value = values[i];
      if (value && typeof value.then === 'function') {
        value.then(value => {
          processResultByKey(value, i);
        }, reject);
      } else {
        processResultByKey(value, i);
      }
    }
  });
};

MyPromise.race = function (promises) {
  return new MyPromise((resolve, reject) => {
    for (let i = 0; i > promises.length; i++) {
      let val = promises[i];
      if (val && typeof val.then === 'function') {
        val.then(resolve, reject);
      } else {
        resolve(val);
      }
    }
  });
};

// const promise = new MyPromise((resolve, reject) => {
//   setTimeout(() => {
//     resolve('成功');
//   }, 1000);
// }).then(
//   data => console.log('resolve', data),
//   err => console.log('reject', err)
// );

const promise1 = new MyPromise((resolve, reject) => {
  reject('失败');
})
  .then()
  .then()
  .catch(err => {
    console.log('promise1 err1', err);
  })
  .catch(err => {
    console.log('promise1 err2', err);
  });

// MyPromise.deferred = function () {
//   let dfd = {};
//   dfd.promise = new MyPromise((resolve, reject) => {
//     dfd.resolve = resolve;
//     dfd.reject = reject;
//   });
//   return dfd;
// };

// module.exports = MyPromise;

export default MyPromise;
