<template>
  <div>
    <button @click="add">{{text}}</button>
  </div>
</template>

<script>
export default {
  name: 'Btn',
  props: ['text'],
  methods: {
    add() {
      this.$emit('add')
    }
  }
}
</script>

<style></style>
