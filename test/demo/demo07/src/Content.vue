<template>
  <div>
    <span>this is a vue demo </span>
    <span v-if="isEven" class="even">even({{count}})</span>
    <span v-else class="odd">odd({{count}})</span>
  </div>
</template>

<script>
import Btn from './Btn.vue'

export default {
  name: 'Content',
  props: ['count'],
  computed: {
    isEven() {
      return this.count % 2 === 0
    }
  }
}
</script>

<style>
  .even {
    color: green;
  }

  .odd {
    color: red;
  }
</style>
