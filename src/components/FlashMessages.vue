<template>
  <div class="flash-message">
    <sui-message
      v-for="(m, $index) in messages"
      :key="`flash-${$index}`"
      v-bind="{
        header: m.header,
        content: m.content,
        [m.type || 'info']: true,
        dismissable: m.persist,
      }"
      @dismiss="dismissFlash(m)"
    />
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  name: 'FlashMessages',
  computed: {
    ...mapState([
      'messages',
    ]),
  },
  methods: {
    ...mapActions([
      'dismissFlash',
    ]),
  },
};
</script>

<style scoped>
  .flash-message {
    position: fixed;
    bottom: 1%;
    width: inherit;
    z-index: 10;
  }
</style>
