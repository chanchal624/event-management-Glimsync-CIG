const tf = require('@tensorflow/tfjs-core');
require('@tensorflow/tfjs-backend-wasm');
const faceapi = require('@vladmandic/face-api/dist/face-api.js');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');

async function init() {
  console.log("Setting up Wasm backend...");
  tf.env().set('WASM_HAS_SIMD_SUPPORT', false);
  tf.env().set('WASM_HAS_MULTITHREAD_SUPPORT', false);
  const wasmPath = path.join(__dirname, '..', 'node_modules', '@tensorflow', 'tfjs-backend-wasm', 'dist', '/');
  tf.wasm.setWasmPaths(wasmPath);
  await tf.setBackend('wasm');
  console.log("Backend:", tf.getBackend());

  const modelsDir = path.join(__dirname, '..', 'public', 'models');
  console.log("Loading models from:", modelsDir);
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelsDir);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(modelsDir);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(modelsDir);
  console.log("Models loaded!");

  const buffer = await sharp({
    create: {
      width: 300,
      height: 300,
      channels: 3,
      background: { r: 255, g: 0, b: 0 }
    }
  }).raw().toBuffer();

  const tensor = tf.tensor3d(new Uint8Array(buffer), [300, 300, 3], 'int32');
  console.log("Tensor created");
  const result = await faceapi.detectAllFaces(tensor).withFaceLandmarks().withFaceDescriptors();
  console.log("Faces detected:", result.length);
  tensor.dispose();
}

init().catch(console.error);
