<template>
  <div>
    <p>I am aaa</p>
    <p>route: {{route}}</p>
  </div>
</template>

<script>
export default {
  name: 'AAA',
  computed: {
    route() {
      return this.$route.path
    }
  }
}
</script>

<style></style>
