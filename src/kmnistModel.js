import * as tf from '@tensorflow/tfjs';

export default {
  load: async () => {
    const modelUrl = 'models/k49-9ffc1695/model.json';
    return tf.loadLayersModel(modelUrl);
  }
}
