<template>
  <div class="wrap">
    <div class="left"></div>
    <div class="right">
      <div class="right-content">
        adasdasdasdadasdasdasdasdasadasdasdasdadasdasadasdasdasdadasdasdasdasdasadasdasdasdadasdas
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.wrap {
  width: 300px;
  height: 100px;
  margin: 30px 0;
  display: flex;
  border: 1px solid red;
  .left {
    flex: 0 0 100px;
    background: lightgray;
  }
  .right {
    flex: 1;
    background: lightblue;
    width: 0;
    &-content {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      background: lightyellow;
    }
  }
}
</style>
