require('dotenv').config()
const fs = require('fs');
const path = require("path");
const sDataFolder = path.join(__dirname, 'data/');
const fetchSectorSystems = require('./libs/sectors');

// check we have this folder
try {
  if(!fs.existsSync(sDataFolder)) {
    console.log(`The folder ${sDataFolder} does not exist.`);
    fs.mkdirSync(path.join(__dirname, "data"));
  }
} catch (err) {
  console.error(err);
  process.exit(1);
}

const sSector = process.env.SECTOR;
const sBuildType = process.env.BUILD_TYPE;  // options: module, ref or system

fetchSectorSystems(sSector, sDataFolder, sBuildType);