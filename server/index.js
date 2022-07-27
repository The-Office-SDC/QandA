const express = require('express');
const pool = require('../database/db.js');
require('dotenv').config();

const app = express();


const port = process.env.EXPRESS_PORT || 3000;






app.listen(port, () => {
  console.log(`listening on PORT ${port}`)
})