<template>
  <div id="app">
    <Content :count="count"></Content>
    <Btn :text="text" @add="add"></Btn>
  </div>
</template>

<script>
import Btn from './Btn.vue'
import Content from './Content.vue'

export default {
  name: 'App',
  components: {
    Btn,
    Content,
  },
  data () {
    return {
      text: 'add',
      count: 1,
    }
  },
  methods: {
    add() {
      this.count = this.count + 1
    }
  }
}
</script>

<style></style>
