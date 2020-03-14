<template>
  <div>
    <a href="https://github.com/sharkykh/tppm">
      <sui-button
        color="black"
        icon="github"
        content="Source"
      />
    </a>
    <sui-divider hidden />
  </div>
</template>

<script>
import {
  SuiButton,
  SuiDivider,
} from './sui-vue';

import Vue from 'vue';

export default Vue.extend({
  name: 'AppFooter',
  components: {
    SuiButton,
    SuiDivider,
  },
});
</script>

<style scoped>
</style>
