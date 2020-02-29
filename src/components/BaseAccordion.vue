<template>
  <div class="wrapper">
    <div class="accordion" @click="toggleItem">
      <h2 class="title">
        <slot name="title"></slot>
      </h2>
    </div>
    <div v-show="show" class="content">
      <slot name="content"></slot>
    </div>
  </div>
</template>

<script>
export default {
  components: {},
  data: function() {
    return {
      show: false
    };
  },
  methods: {
    toggleItem: function() {
      this.show = !this.show;
    }
  }
};
</script>

<style scoped>
.wrapper {
  margin: 0 auto;
  width: 100%;
  padding: 2px;
}
.accordion {
  display: flex;
  background-color: #5995DA;  /* Blue */
  cursor: pointer;
  margin: 0;
  font-size: 7px;
  font-weight: bold;
}
.title {
  margin: 0;
  color: White;
}
.content {
  width: 100%;
}
</style>