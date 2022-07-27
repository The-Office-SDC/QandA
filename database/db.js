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


const query = (text, callback) => {
  pool.connect();
  pool.query(text, (err, res) => {
    if (err) {
      console.log(err)
    } else {
      callback(res)
    }
  })
  pool.end();
}

export.module.query = query;










