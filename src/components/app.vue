<template>
  <div>
    <h1>{{ title }}</h1>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      title: 'Trakt Playback Progress Manager'
    };
  }
};
</script>

<style scoped>
  div {
    text-align: center;
  }
</style>