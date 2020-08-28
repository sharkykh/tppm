<template>
  <div>
    <a
      href="https://github.com/sharkykh/tppm"
      :title="`Version: ${version}`"
    >
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
import Vue from 'vue';

import {
  SuiButton,
  SuiDivider,
} from './sui-vue';

export default Vue.extend({
  name: 'AppFooter',
  components: {
    SuiButton,
    SuiDivider,
  },
  data() {
    return {
      version: __VERSION__,
    };
  },
});
</script>

<style scoped>
</style>
