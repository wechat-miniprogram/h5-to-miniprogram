<template>
  <div id="app">
    <ul class="tabbar">
      <li><router-link class="link" to="/h5-to-miniprogram/aaa">aaa</router-link></li>
      <li><router-link class="link" to="/h5-to-miniprogram/bbb">bbb</router-link></li>
    </ul>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'App',
  components: {},
}
</script>

<style>
.tabbar {
  display: flex;
  list-style: none;
}
.tabbar li {
  position: relative;
  display: block;
  height: 50px;
  width: 80px;
  text-align: center;
  line-height: 50px;
  background: #dff1e7;
  margin: 5px;
}
.tabbar li .link {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
