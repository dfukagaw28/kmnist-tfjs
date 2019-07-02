<template>
  <div class="container">
    <div class="content">
      <canvas width="28" height="28" ref="canvas"
        @mousemove="canvasMouseMove"
        @touchmove.stop="canvasMouseMove"
        @touchend.stop="offedit"
        @mouseup="offedit"
        @touchstart.prevent="onedit"
        @mousedown="onedit"></canvas>
      <svg viewBox="0, 0, 280, 280">
        <rect x="40" y="40" width="200" height="200" stroke="pink" stroke-width="1" stroke-dasharray="4 4" fill="none" />
      </svg>
      <button @click="resetCanvas">Reset</button>
    </div>
    <div class="result">
      <table>
        <thead>
          <tr>
            <th>char</th>
            <th>weight</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="candidate in candidates">
            <td>{{ candidate.char }}</td>
            <td>{{ candidate.weight }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import * as tf from '@tensorflow/tfjs';
import kmnistModel from '@/kmnistModel.js';
import csvParseSync from 'csv-parse/lib/sync';
const ClassMapUrl = './data/k49_classmap.csv';
const numClasses = 49;

export default {
  name: 'mycanvas',
  mounted() {
    this.initialize();
    /*
    this.resetCanvas();
    window.addEventListener('mouseup', this.offedit);

    this.myModel = kmnistModel.load();
    const temp = this.loadClassMap();
    console.log(temp);

    this.myModel
    .then(model => {
      // eslint-disable-next-line no-console
      console.log(model);
      return this.predict();
    })
    .then(output => {
      // eslint-disable-next-line no-console
      console.log(output);
      this.$set(this, 'output', output);
      this.resetCanvas();
    });
    */
  },
  data() {
    return {
      candidates: [],
      output: [],
      labels: null,
      edit: false,
      lastPosX: null,
      lastPosY: null,
      modelPromise: null,
      predictBusy: false,
    };
  },
  methods: {
    async initialize() {
      // Clear the canvas
      this.resetCanvas();
      window.addEventListener('mouseup', this.offedit);

      // Load the model
      this.modelPromise = await kmnistModel.load();
      this.labels = await this.loadClassMap();

      // Predict
      //const result = await this.predict();
      //console.log(result);
    },
    async loadClassMap() {
      const response = await fetch(ClassMapUrl);
      const text = await response.text();
      const csv = csvParseSync(text);
      const labels = [];
      for (let i = 1; i < csv.length; i++) {
        labels.push(csv[i][2]);
      }
      return labels;
    },
    canvasMouseMove(event) {
      if (!this.edit) { return; }
      const clientRect = event.target.getBoundingClientRect();
      const x =  ((event.clientX || event.touches[0].clientX) - clientRect.left) * 28 / event.target.offsetWidth;
      const y =  ((event.clientY || event.touches[0].clientY) - clientRect.top ) * 28 / event.target.offsetHeight;

      this.lastPosX = this.lastPosX || x;
      this.lastPosY = this.lastPosY || y;

      const canvas = this.$refs['canvas'];
      const ctx = canvas.getContext('2d');
      ctx.shadowColor = 'white';
      ctx.shadowBlur = 1;
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 1;
      ctx.lineCap = 'round';

      ctx.beginPath();
      ctx.moveTo(this.lastPosX, this.lastPosY);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.closePath();

      this.lastPosX = x;
      this.lastPosY = y;
    },
    resetCanvas() {
      // Get canvas and context objects
      let canvas = this.$refs['canvas'];
      const ctx = canvas.getContext('2d');
      // Fill by black
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      // Reset candidates
      const output = new Array(numClasses);
      output.fill(0);
      this.updateOutput(output);
    },
    onedit() {
      // eslint-disable-next-line no-console
      console.log('startEdit');
      this.edit = true;
    },
    offedit() {
      if (!this.edit) { return; }
      // eslint-disable-next-line no-console
      console.log('endEdit');

      this.edit = false;
      this.lastPosX = null;
      this.lastPosY = null;

      (async () => {
        const result = await this.predict();
        this.updateOutput(result);
      })();
    },
    updateOutput(result) {
      // eslint-disable-next-line no-console
      console.log(result);
      this.$set(this, 'output_raw', result);
      this.$set(this, 'output', result.map(v => v.toFixed(10)));

      // Update candidates
      if (!this.labels) { return; }
      if (!result) { return; }
      const indice = Array.from(Array(numClasses), (v, k) => k);
      indice.sort((i, j) => (result[j] - result[i]));
      const newCandidates = [];
      for (let i = 0; i < 5; i++) {
        const k = indice[i];
        newCandidates.push({
          'weight': result[k],
          'char': this.labels[k],
          //'codePoint': this.labels[k].codePointAt(0);
        });
      }
      this.$set(this, 'candidates', newCandidates);
    },
    async predict() {
      if (!this.modelPromise) { return []; }

      // Get an image tensor from the canvas
      const canvas = this.$refs['canvas'];
      let imageTensor = tf.browser.fromPixels(canvas, 1);
      imageTensor = imageTensor.asType('float32').div(tf.scalar(255));
      imageTensor = imageTensor.reshape([1, 28, 28, 1]);
      // eslint-disable-next-line no-console
      console.log(imageTensor);

      // Predict
      const result = this.modelPromise.predict(imageTensor, { batchSize: 1 })
        .flatten()
        .array();
      // eslint-disable-next-line no-console
      console.log(result);
      return result;
      /*
      console.log(this.myModel);
      return this.myModel.then(model => {
        const canvas = this.$refs['canvas'];
        let imageTensor = tf.browser.fromPixels(canvas, 1);
        imageTensor = imageTensor.asType('float32').div(tf.scalar(255));
        imageTensor = imageTensor.reshape([1, 28, 28]);
        console.log(imageTensor);
        return model.predict(imageTensor, { batchSize: 1 })
          .flatten()
          .array();
      });
      */
    },
  },
}
</script>

<style lang="scss">
  .container {
    max-width: 400px;
    margin: 10px auto;
  }
  .content {
    position: relative;
    width: 100%;
    height: 100%;
    & > * {
      width: 100%;
      height: 100%;
    }
    & svg, & .circular {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }
    & svg {
      pointer-events: none;
    }
    & .circular {
      background-color: rgba(255,255,255,0.9);
    }
  }
</style>

