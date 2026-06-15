<script setup>
  import ApiTest from './components/ApiTest.vue'
</script>

# 接口测试平台

## yapi 简介

yapi 是一个开源的接口管理平台，目前 star 数量 27.3k，具备以下特性：

1. 权限管理
2. 项目管理
3. 可视化接口管理，接口修改记录可追溯
4. 基于 mock.js，方便的 mock 数据生成器
5. 接口自动化测试
6. 数据导入，支持 swagger、postman、har 数据格式，便于迁移

## 快速上手

新建项目->新建分类->添加接口

> 手动演示

配置接口代理，使用`nginx`或者`代理工具`配置代理

#### 举例 nginx 代理配置

```nginx
server {
  listen 443 ssl;
  server_name test.jarrett.com;

  ssl_certificate SSL/test.jarrett.com.crt;
  ssl_certificate_key SSL/test.jarrett.com.key;

  location / {
    proxy_pass https://xx.xx.x.xxx:443/;
    proxy_set_header Host https://xx.xx.x.xxx:443/;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Photo $scheme;
  }

  location /api/getUsers{
    proxy_pass http://xx.xx.x.xxx:3000/mock/83/api/getUsers;
    proxy_set_header Host http://xx.xx.x.xxx:3000;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Photo $scheme;
  }
}
```

vite 热更新配置

```json
{
  "server": {
    "hmr": {
      "port": 8888 // 对应nginx监听的端口
    }
  }
}
```

接口测试
<ClientOnly>
<ApiTest/>
</ClientOnly>

## 创建模拟数据

### mockjs 使用语法

[数据模板定义示例](http://mockjs.com/examples.html)

常用语法

```json
{
  "age|1-100": 100,
  "value|123.3": 123.111,
  "isVip|1-2": true,
  "list|1-100": [{ "name": "test" }],
  "address|2": {
    "310000": "上海市",
    "320000": "江苏省",
    "330000": "浙江省",
    "340000": "安徽省"
  }
}
```

### json-schema

![json-schema](/plan/api-test/images/schema-mock.png)

## 高级 mock

### Mock 期望

- 自定义过滤规则，返回自定义数据，支持 mock
- 可定义接口延时
- 可定义 http 状态码

### 自定义 Mock 脚本

#### 全局变量

请求

- `header` 请求的 HTTP 头
- `params` 请求参数，包括 Body、Query 中所有参数
- `cookie` 请求带的 Cookies

响应

- `mockJson` 接口定义的响应数据 Mock 模板
- `resHeader` 响应的 HTTP 头
- `httpCode` 响应的 HTTP 状态码
- `delay` Mock 响应延时，单位为 ms
- `Random` Mock.Random 方法，可以添加自定义占位符,详细使用方法请查看

示例 1，根据请求参数重写 mockJson

```js
if (params.type == 1) {
  mockJson.errcode = 400;
  mockJson.errmsg = 'error';
}

if (header.token == 't') {
  mockJson.errcode = 300;
  mockJson.errmsg = 'error';
}

if (cookie.type == 'a') {
  mockJson.errcode = 500;
  mockJson.errmsg = 'error';
}
```

## 自动化测试

传统的接口自动化测试成本高，大量的项目没有使用自动化测试保证接口的质量，仅仅依靠手动测试，是非常不可靠和容易出错的。

YApi 为了解决这个问题，开发了可视化接口自动化测试功能，只需要配置每个接口的入参和对 RESPONSE 断言，即可实现对接口的自动化测试，大大提升了接口测试的效率。

![自动化测试](/plan/api-test/images/case-list.gif)

用例之间可以互相引用数据

![](/plan/api-test/images/case_key_list.png)

![](/plan/api-test/images/case_key_query.png)

## 竞品

市面上还有一些商业化接口管理平台，如 Apifox，提供了更加丰富的功能，可付费私有化部署

[Apifox](https://app.apifox.com/main/teams/2803313?tab=project)

### 数据模型

![数据模型](/plan/api-test/images/model.png)

### 组件

![编辑组件](/plan/api-test/images/edit-component.png)

![使用组件](/plan/api-test/images/use-component.png)
