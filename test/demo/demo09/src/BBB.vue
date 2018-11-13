<template>
  <div>
    <p>I am bbb</p>
    <p>route: {{route}}</p>
  </div>
</template>

<script>
export default {
  name: 'BBB',
  computed: {
    route() {
      return this.$route.path
    }
  }
}
</script>

<style></style>
