# 小程序

主要是微信小程序

## 踩坑记录

### 单页模式，提示无法触发

小程序转发到朋友圈，会进入单页模式，该模式下，大多数内置 api 被禁用，调用会提示“请前往小程序使用完整功能”，在特定情况下无法触发该提示

```typescript
// 能触发提示
setTimeout(() => {
  wx.navigateTo({ url: 'test' });
});

// 无法触发提示
setTimeout(() => {
  wx.navigateTo({ url: 'test' });
}, 100);
```

出现在按钮调用 debounce 函数包裹的业务逻辑中，可以使用 lodash 提供的 debounce 的 leading:true 设置点击立即触发来解决

### 遮罩层导致的 ios 键盘无法呼出的问题

```html
<van-overlay>
  <van-field focus="{{openKeyBoard}}" />
  <van-button disabled="{{disabled}}" bind:click="handleSubmit">发送</van-button>
</van-overlay>
```

- 使用 van-overlay，将 openKeyBoard 置为 true，ios、鸿蒙皆无法唤起键盘
- 使用微信官方提供的 page-container 组件，安卓、鸿蒙可唤起键盘，ios 不能，键盘弹出即消失
- 自行使用 fixed 实现遮罩，键盘呼出正常，发送按钮点击无效，使用 bind:tap + 事件函数逻辑中判断是否禁用解决
