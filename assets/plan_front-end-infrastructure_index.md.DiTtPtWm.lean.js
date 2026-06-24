import{g as C,a3 as r,H as g,E as y,a4 as a,Q as i,f as h,aj as l,K as A,bY as u,bZ as D,b_ as m,b$ as B,c0 as b,c1 as f,c2 as x,c3 as S}from"./chunks/framework.D0OZbHhS.js";import{v as n}from"./chunks/theme.C88iaKfZ.js";import{A as T}from"./chunks/ApiTest.CBKPiXGt.js";import{_,a as v}from"./chunks/Zod.vue_vue_type_script_setup_true_lang.cGhqJ1Dy.js";/* empty css                                                                       */const P={class:"h-500px"},I=C({__name:"Intro",setup(F){const k={direction:1},p={topic:"项目迭代",id:n(),expanded:!0,children:[{id:n(),topic:"开发前期",children:[{id:n(),topic:"接口文档"},{id:n(),topic:"接口数据mock"},{id:n(),topic:"编译时类型校验"},{id:n(),topic:"运行时接口数据校验"}]},{id:n(),topic:"前后端联调",children:[{id:n(),topic:"接口文档改动diff、历史记录"},{id:n(),topic:"接口mock"}]},{id:n(),topic:"测试上线",children:[{id:n(),topic:"运行时接口数据校验、日志上报"}]}]};return(E,d)=>{const e=r("MindMap");return g(),y("div",P,[a(e,{data:{nodeData:p},options:k},null,8,["data"])])}}}),w=JSON.parse('{"title":"前端基建 ——— 接口、数据、类型在前端开发中的管理及应用","description":"","frontmatter":{},"headers":[],"relativePath":"plan/front-end-infrastructure/index.md","filePath":"plan/front-end-infrastructure/index.md","lastUpdated":1782283873000}'),q={name:"plan/front-end-infrastructure/index.md"},L=Object.assign(q,{setup(F){const k=`
type MyType<T> = T extends string ? T : '1';
const a: MyType<string> = 'test';
const b: MyType<number> = 1
`,p=`
declare namespace MySpace {
  interface UserType {}
}

const user: MySpace.UserType = {};


declare namespace WechatMiniprogram {
    type IAnyObject = Record<string, any>
    interface Target<DataSet extends IAnyObject = IAnyObject> {
        /** 事件组件的 id */
        id: string
        /** 当前组件的类型 */
        tagName?: string
        /** 事件组件上由 'data-' 开头的自定义属性组成的集合 */
        dataset: DataSet
        /** 距离页面顶部的偏移量 */
        offsetTop: number
        /** 距离页面左边的偏移量 */
        offsetLeft: number
    }

    /** 基础事件参数 */
    interface BaseEvent<
        Mark extends IAnyObject = IAnyObject,
        CurrentTargetDataset extends IAnyObject = IAnyObject,
        TargetDataset extends IAnyObject = CurrentTargetDataset
    > {
        /** 事件类型 */
        type: string
        /** 页面打开到触发事件所经过的毫秒数 */
        timeStamp: number
        /** 事件冒泡路径上所有由 'mark:' 开头的自定义属性组成的集合 */
        mark?: Mark
        /** 触发事件的源组件 */
        target: Target<TargetDataset>
        /** 事件绑定的当前组件 */
        currentTarget: Target<CurrentTargetDataset>
    }

       /** 自定义事件 */
    interface CustomEvent<
        Detail extends IAnyObject = IAnyObject,
        Mark extends IAnyObject = IAnyObject,
        CurrentTargetDataset extends IAnyObject = IAnyObject,
        TargetDataset extends IAnyObject = CurrentTargetDataset
    > extends BaseEvent<Mark, CurrentTargetDataset, TargetDataset> {
        /** 额外的信息 */
        detail: Detail
    }
}


function handleTap(e:WechatMiniprogram.CustomEvent<{name:string}>){
  console.log(e.detail.name);
}
`,E=`
// 使用泛型声明对象
interface Student<Sex = string, Info = string> {
  name: string;
  age: number;
  sex: Sex;
  info: Info extends string ? Info : {
    address: string;
    phone: number;
  }
}

// 默认导出也可使用泛型约束类型
export default <Student>{
  name: '谷雨',
  age: 18,
  sex: 'male'
}

const student: Student<'female', []> = {
  name: '谷雨',
  age: 18,
  sex: 'male'
}

// 你可能会这样声明函数
const add = (a: number, b: number) => a + b;

// 更好的方式
type Add<T> = (a: T, b: T) => T;

// T可代表任何类型
const addN: Add<number> = (a, b) => a + b;
const addS: Add<string> = (a, b) => a + b;

addN(1, '2');
addS(2, 3);

function getDetail<T extends object>(id: number): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const data = {} as T
      resolve(data)
    }, 1000)
  })
}

interface Result {
  name: string;
  age: number;
}

const detail = getDetail<Result>(1234);

detail.then(res => {
  res.age;
  res.name;
})

`,d=`
// 继承
interface Person {
  name: string;
  age: number;
}

interface Employee extends Person{
  id: number;
}

interface Employee {
  payed: number;
}

// 交叉类型可以实现继承的效果
type Employer = { title: string } & Person;
type SomeOne = Employee | Employer

const person1: Employee = {
  id: 123,
  name: '老王',
  age: 30
}

const person2: Employer = {
  title: '部门主管',
  name: '王老板',
  age: 40
}

const person3: SomeOne = {

}
`,e=`
// 能生成真实对象并操作
enum Status{
 SUCCESS,
 FAIL,
 PENDING,
}

const enum ConstStatus {
 SUCCESS,
 FAIL,
 PENDING,
}

const _ConstStatus = {
  SUCCESS: 0,
  FAIL: 1,
  PENDING: 2
} as const;

 	
console.log(Status.SUCCESS,ConstStatus.SUCCESS,_ConstStatus.SUCCESS);

Status.SUCCESS = 111;
ConstStatus.SUCCESS = 111;
_ConstStatus.SUCCESS = 111;
Status[0] === 'SUCCESS'
`,c=`
/* service层定义接口及入参出参类型 */

/*--------------- /services/base/types.ts ----------------*/

export interface BaseResponse {
  msg: string;
  code: number;
}

interface RequestParams<T> {
  url: string;
  method: 'GET' | 'POST';
  query: T;
}

/*---------------------------------------------------------*/



/*--------------- /services/base/request.ts ----------------*/

function sendRequest<Response extends object, Params>(params?: RequestParams<Params>): Promise<Response> {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(params);
      const data = {} as Response
      resolve(data)
    }, 1000)
  })
}

/*---------------------------------------------------------*/



/*--------------- /services/order-service/types.ts ---------------*/
enum Status {
  SUCCESS,
  FAIL
}
export interface ListItem {
  name: string;
  age: number;
  status: Status;
  children: ListItem[];
}
export interface DetailResponse extends BaseResponse {
  data: {
    id: string;
    name: string;
    list: ListItem[]
  }
}

export type Data = DetailResponse['data']
export type List = DetailResponse['data']['list']
export type DataWithoutId = Omit<Data, 'id'>

/*---------------------------------------------------------*/



/*--------------- /services/order-services/api.ts ---------------*/
export function getDetail<Params extends { id: number }>(query: Params) {
  return sendRequest<DetailResponse, Params>({
    method: 'GET',
    url: '/spi/detail',
    query
  })
}
/*---------------------------------------------------------*/




/*--------------- 业务层使用 ---------------*/

const data = {
  list: [] as Data['list'],
  info: {} as Pick<Data, 'id' | 'name'>
}
getDetail({ id: 123 }).then(res => {
  res.data.id
  res.code
  console.log(res)
  data.list = res.data.list
  data.info.name = res.data.name
})
/*---------------------------------------------------------*/

`;return(j,s)=>{const o=r("ClientOnly"),t=r("CodeEditor");return g(),y("div",null,[s[0]||(s[0]=i("h1",{id:"前端基建-———-接口、数据、类型在前端开发中的管理及应用",tabindex:"-1"},[h("前端基建 ——— 接口、数据、类型在前端开发中的管理及应用 "),i("a",{class:"header-anchor",href:"#前端基建-———-接口、数据、类型在前端开发中的管理及应用","aria-label":"Permalink to “前端基建 ——— 接口、数据、类型在前端开发中的管理及应用”"},"​")],-1)),s[1]||(s[1]=i("h2",{id:"背景",tabindex:"-1"},[h("背景 "),i("a",{class:"header-anchor",href:"#背景","aria-label":"Permalink to “背景”"},"​")],-1)),s[2]||(s[2]=i("p",null,[h("前端基建，包括"),i("code",null,"构建工具、规范与质量保障、自动化测试、组件库、前后端协作"),h("等等")],-1)),s[3]||(s[3]=i("p",null,"目的是为了实现标准化 + 规范化 + 工具化 + 自动化，业务支撑是活在当下，技术基建是活好未来",-1)),s[4]||(s[4]=i("p",null,"本文主要针对前后端协作及质量保障展开。",-1)),s[5]||(s[5]=i("p",null,"接口、数据、类型贯穿了开发流程的始终：",-1)),a(I),s[6]||(s[6]=l("",15)),a(o,null,{default:A(()=>[a(T)]),_:1}),s[7]||(s[7]=l("",38)),a(t,{value:d}),s[8]||(s[8]=i("h3",{id:"条件类型",tabindex:"-1"},[h("条件类型 "),i("a",{class:"header-anchor",href:"#条件类型","aria-label":"Permalink to “条件类型”"},"​")],-1)),s[9]||(s[9]=i("p",null,"extends 既可以用于继承，也可用于类型约束",-1)),a(t,{value:k}),s[10]||(s[10]=i("h3",{id:"namespace",tabindex:"-1"},[h("namespace "),i("a",{class:"header-anchor",href:"#namespace","aria-label":"Permalink to “namespace”"},"​")],-1)),s[11]||(s[11]=i("p",null,"用于防止类型重命名冲突，比如微信小程序提供了全局类型的 namespace",-1)),a(t,{value:p}),s[12]||(s[12]=i("h3",{id:"泛型",tabindex:"-1"},[h("泛型 "),i("a",{class:"header-anchor",href:"#泛型","aria-label":"Permalink to “泛型”"},"​")],-1)),s[13]||(s[13]=i("p",null,"合理使用泛型是 ts 的精髓，能够更好的封装通用方法",-1)),s[14]||(s[14]=i("p",null,"学会泛型能够轻松阅读各类社区库的类型声明，良好的变量命名、类型声明很多时候可以替代文档",-1)),a(t,{value:E}),s[15]||(s[15]=i("h3",{id:"枚举-常量枚举",tabindex:"-1"},[h("枚举 & 常量枚举 "),i("a",{class:"header-anchor",href:"#枚举-常量枚举","aria-label":"Permalink to “枚举 & 常量枚举”"},"​")],-1)),s[16]||(s[16]=i("p",null,[h("业务代码中常有关于枚举的判断，比如"),i("code",null,"data.status===1"),h("，这可能分散在各个项目文件，并且缺失语义")],-1)),s[17]||(s[17]=i("div",{class:"danger custom-block"},[i("p",{class:"custom-block-title"},"建议"),i("p",null,"如果不想在业务变动时一处处地逐个修改枚举判断，建议所有使用常量或枚举而不是硬编码")],-1)),a(t,{value:e}),s[18]||(s[18]=l("",35)),a(_),a(t,{value:c}),s[19]||(s[19]=l("",7)),a(v),s[20]||(s[20]=l("",1))])}}});export{w as __pageData,L as default};
