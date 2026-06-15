1. 实现以下类型（尽量使用 util type）:

- 一类对象, 它的 value 值为 string 或者 number

```ts
// 解答
type union = string | number;

interface Obj {
  [key: union]: union;
}

// 或者

type Obj1 = Record<any, union>;
```

- 已知 interface T1, T2, 求类型 T3, 要求 T3 拥有 T1 和 T2 的所有属性, 对应 value 的类型也和 T1,T2 一样

```ts
// 解答

interface T1 {
  name: string;
}

interface T2 {
  age: number;
}

type T3 = Omit<T1, keyof T2> & T2; // 如果直接使用交叉类型，会使同名属性为 nerver
```

1. 求 ItemWithoutType, 要求能正确反映函数 omitType 的返回类型（尽量使用 util type）

```ts
interface Item {
  type: string;
  value: any;
}

// 解答
type ItemWithoutType = Omit<Item, 'type'>;

function omitType<T extends Item>(obj: T): ItemWithoutType {
  const result = { ...obj };
  delete result.type;
  return result;
}
```

3. 已知函数 getAPlusB, 用 ts 限制它的入参, 使它总能符合我们的预期(返回数字)

```ts
interface PlusObj {
  [key: string]: any;
  a: number;
  b: number;
}

function getAPlusB(obj: PlusObj) {
  return obj.a + obj.b;
}
```

4. 考虑在工作中你碰到这样的场景: `IFoo` 来自于一个依赖库, 随着升级它可能会不断增加新的属性, 请实现 interface `IFooMapping`, 要求: 对于 `IFoo` 所有的 key, 都满足 `IFooMapping[key]` 的类型是返回为 `IFoo[key]` 的函数。 比如 `IFoo['a']` 为 `string`, 则 `IFooMapping['a']` 为返回类型为 `string` 的函数(如能使用泛型实现更好)

```ts
interface IFoo {
  a: string;
  b: number;
  // ...
}

// 解答
type IFooMapping<T> = {
  [K in keyof T]: () => T[K];
};
```

1. 请写出 event 的类型

```ts
// 答案
type Foo = (event: MouseEvent) => void;

const foo: Foo = event => {
  // ...
};

window.addEventListener('click', foo);
```

2. 请实现这样的泛型: 当 T 的 type 属性类型为 string 时, 得到 `{ obj: T }` , 否则得到 `null`

```ts
// 答案
type IFoo<T> = T extends string ? { obj: T } : null;
```

```ts
/**
 * extends 继承关键字
 * 复杂类型对象，子只需包含父的属性，即符合继承关系
 * 文档上的例子说明https://www.typescriptlang.org/docs/handbook/2/generics.html#generic-constraints
 * 简单类型，ts允许使用extends关键字对类型做判断，不是严格意义上的继承
 * String类允许被继承，继承的是一系列的String类的属性和方法
 * 其他语言比如java，String类，被final修饰符修饰，是不可被继承和改变的
 */

type Bar<T> = T extends { name: string } ? string : number;

const bar1: Bar<{ name: string; age: number }> = '张三'; // 包含父中的属性即合法
const bar2: Bar<{ age: number }> = '张三'; // 不能将类型“string”分配给类型“number

type IFoo<T> = T extends string ? { obj: T } : null;

const foo1: IFoo<string> = { obj: '123' }; // ok
const foo2: IFoo<'str'> = { obj: '123' }; // 不能将类型“"123"”分配给类型“"str"”

// string 是类型，String是类
type IFooStringObj<T> = T extends String ? { obj: T } : null;
const foo3: IFooStringObj<'123'> = { obj: '123' }; // ok
const foo4: IFooStringObj<string> = { obj: '123' }; // ok

interface FakeString extends String {
  a: number;
} // 报错，缺少一系列String的方法

type FakeString2 = 123 extends string // 报错，类型声明type中的extends关键字不是严格意义上的继承
interface N3 extends string {} // 报错"string"仅表示类型，但在此处却作为值使用
interface N4 extends String {} // ok
```

3. 请用 jsdoc 在 js 中实现第一题, 建议把类型写在 .d.ts 文件中, 在 js 文件中 import 类型

```js
/**
 *
 * @param {MouseEvent} event
 */
const foo = event => {
  // ...
  console.log(event);
};
```
