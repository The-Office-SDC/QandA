const {Pool} = require('pg');
require('dotenv').config();


const options = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'questionsandanswers'
}


const pool = new Pool(options);


const query = (text, params, callback) => {
  pool.connect();
  pool.query(text, params, (err, res) => {
callback(err, res)
  })
}

module.exports.query = query;










