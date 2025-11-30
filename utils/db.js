const db = require("../db.js");

// Ensure database is properly initialized
function runAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        console.error(`[DB Error] SQL: ${sql}`);
        console.error(`[DB Error] Params: ${JSON.stringify(params)}`);
        console.error(`[DB Error] Message: ${err.message}`);
        reject(err);
      } else {
        resolve(this);
      }
    });
  });
}

function getAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        console.error(`[DB Error] SQL: ${sql}`);
        console.error(`[DB Error] Params: ${JSON.stringify(params)}`);
        console.error(`[DB Error] Message: ${err.message}`);
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

function allAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, row) => {
      if (err) {
        console.error(`[DB Error] SQL: ${sql}`);
        console.error(`[DB Error] Params: ${JSON.stringify(params)}`);
        console.error(`[DB Error] Message: ${err.message}`);
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}
module.exports = {
  getAsync,
  runAsync,
  allAsync,
};
