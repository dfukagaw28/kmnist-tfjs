<template>
  <div id="app">
    <h1>Kana Kuzushiji (K49) Recognition</h1>
    <MyCanvas/>
    <p>
      <a href="./models/k49-9ffc1695.hdf5">Download HDF5 file (14 MB)</a>
    </p>
    <div>
      <h4>About this app</h4>
      <p>
        Thanks:
        <a href="https://github.com/amanoese/mnist-tensorflow-js">mnist-tensorflow-js</a> /
        <a href="https://jp.vuejs.org/index.html">Vue.js</a> /
        <a href="https://www.tensorflow.org/js">TensorFlow.js</a>
      </p>
      <p>Author: Daiji Fukagawa, CIS, Doshisha Univ.</p>
      <p>Repo: <a href="https://github.com/dfukagaw28/kmnist-tfjs">GH:dfukagaw28/kmnist-tfjs</a></p>
    </div>
  </div>
</template>

<script>
import MyCanvas from './components/MyCanvas.vue'

export default {
  name: 'app',
  components: {
    MyCanvas
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
