const https = require('https');
const fs = require('fs');
const path = require('path');

const modelsUrl = 'https://raw.githubusercontent.com/vladmandic/face-api/master/model/';
const modelsDir = path.join(__dirname, '..', 'public', 'models');

if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir, { recursive: true });
}

const files = [
  'ssd_mobilenetv1_model-weights_manifest.json',
  'ssd_mobilenetv1_model-shard1',
  'ssd_mobilenetv1_model-shard2',
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model-shard1',
  'face_recognition_model-weights_manifest.json',
  'face_recognition_model-shard1',
  'face_recognition_model-shard2'
];

async function downloadFile(filename) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(modelsDir, filename);
    if (fs.existsSync(filePath)) {
      console.log(`Already exists: ${filename}`);
      return resolve();
    }
    console.log(`Downloading ${filename}...`);
    const file = fs.createWriteStream(filePath);
    https.get(modelsUrl + filename, (response) => {
      if (response.statusCode !== 200) {
        fs.unlinkSync(filePath);
        return reject(new Error(`Failed to get '${filename}' (${response.statusCode})`));
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlinkSync(filePath);
      reject(err);
    });
  });
}

async function run() {
  for (const file of files) {
    try {
      await downloadFile(file);
    } catch (err) {
      console.error(err);
    }
  }
  console.log('All models downloaded successfully!');
}

run();
