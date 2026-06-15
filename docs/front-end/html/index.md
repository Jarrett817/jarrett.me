---
title: html
desc: 《JavaScript设计模式》、《大话设计模式》笔记
keywords: 设计模式、笔记
date: 2020-02-17 01:01:00
cover: https://cdn.jsdelivr.net/gh/chengpeiquan/assets-storage/img/2020/02/1.jpg
---

# html

## 语义化

- 是什么？是一种写 HTML 标签的方法论
- 怎么做？根据内容结构选择合适的标签，内容语义化+代码语义化
- 解决了什么问题？明确了书写规范，便于开发者阅读和写出更优雅的代码结构的同时，方便搜索引擎检索

注意点：

- 尽可能少用无意义的 div 和 span
- 语义不明显时，div 和 p 选 p，p 在默认情况下有上下间距，对兼容特殊终端有利
- 不使用纯样式标签，如：b、font，改用 css 设置
- 表格，标题用 caption、表头用 thead、主体用 tbody、尾部用 tfoot，表头用 th、单元格用 td
- 表单域用 fieldset 标签包起来，用 legend 标签说明表单用途
- input 标签的说明文本需要使用 label 标签，并通过为 input 设置 id 属性，在 label 标签中设置 for=xxx 来让说明文本和相对应的 input 关联起来

## HTML5 新标签和新特性

新标签：

- 文章相关的：header、main、footer、nav、section、article、figure、mark
- 多媒体相关的：video、audio、svg、canvas
- 表单相关的：type=email、type=tel

新特性：

主要是关于图像、位置、存储、多任务等功能的增加

- 拖拽释放的 api
- 语义化的标签
- 地理 api、音频、视频 api、画布 api
- localStorage、sessionStorage
- 表单控件，calendar、date、time、email、url、search

## title 和 alt 属性

- 两个属性都是当鼠标滑动到元素上的时候显示
- alt 是 img 的特有属性，是图片内容的等价描述，图片无法显示的时候显示文字
- title 可以用在除了 base、baseFont、head、html、meta、param、script、title 之外的所有标签，是对 dom 元素的一种类似注释说明

## HTML 全局属性

- class
- data-\*增加自定义属性
- draggable 元素可拖拽
- id
- lang
- style
- title 元素相关建议信息

## Canvas 和 Svg 的区别

- canvas 用笔刷来绘制 2d 图形
- svg 用标签来绘制不规则矢量图
- 相同点：都是主要用来画 2d 图形的
- 不同点：canvas 是位图，放大会失真，svg 是矢量图
- 不同点：svg 节点过多，渲染性能不如 canvas，但是 canvas 写起来复杂
- 不同点：svg 支持分层和事件，与普通 html 标签相似，canvas 不支持，但是可以模拟实现
- canvas 无法对已经绘制的图像进行修改，每次更改都是重新绘制，svg 可以获取到标签进行操作

## 头部元素

```html
<title>可以添加文档标题
<meta>
```

- charset 指定字符集
- name 制定 meta 元素的类型，说明了包含的信息
- content 指定了实际的元数据内容

## a 标签

利用`<a/>`标签进行下载时，建议写明文件的后缀，浏览器会将 download 中的最后一个`.`符号识别为文件后缀，如果文件名中含有`.`会导致下载的文件后缀不正确。

需要注意的是，`/`、`\`会被浏览器自动转换成`_`，`.`则不会转换
