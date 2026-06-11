/**
 * Scarica i modelli face-api.js necessari per il rilevamento genere (admin).
 * Esegui: node scripts/download-models.js
 */
const https = require("https");
const fs = require("fs");
const path = require("path");

const BASE = "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights";
const MODELS = [
  "tiny_face_detector_model-weights_manifest.json",
  "tiny_face_detector_model-shard1",
  "age_gender_model-weights_manifest.json",
  "age_gender_model-shard1",
];

const outDir = path.join(__dirname, "..", "public", "models");
fs.mkdirSync(outDir, { recursive: true });

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      res.pipe(file);
      file.on("finish", () => { file.close(); resolve(); });
    }).on("error", reject);
  });
}

(async () => {
  console.log("Scaricamento modelli face-api.js...");
  for (const model of MODELS) {
    const url = `${BASE}/${model}`;
    const dest = path.join(outDir, model);
    process.stdout.write(`  ${model}... `);
    await download(url, dest);
    console.log("OK");
  }
  console.log("Modelli scaricati in public/models/");
})();
