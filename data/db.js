const fs = require('fs');
const path = require('path');
const { initialData, DB_PATH } = require('./initialData');

function getDb() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2), 'utf-8');
      return JSON.parse(JSON.stringify(initialData));
    }
    const content = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error("DB Read Error:", err);
    return JSON.parse(JSON.stringify(initialData));
  }
}

function saveDb(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error("DB Write Error:", err);
    return false;
  }
}

module.exports = {
  getDb,
  saveDb
};

