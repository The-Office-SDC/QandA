const express = require('express');
const pool = require('../database/db.js');
const returnQuestions = require('./models/questions.js')
require('dotenv').config();
const app = express();
app.use(express.json());



const port = process.env.EXPRESS_PORT || 3000;


app.get('/qa/questions', (req, res) => {
  var { product_id, count = 5, page = 0 } = req.query;
  console.log(count, page)
  pool.query(

    `SELECT json_build_object(
      'product_id', $1::int,
      'results', json_agg(json_build_object(
        'question_id', q.id,
        'questions_body', q.body,
        'question_date', q.date_written,
        'asker_name', q.ask_name,
        'question_helpfulness', q.helpful,
        'reported', q.reported,
        'answers', json_build_object(
          a.id, json_build_object(
            'id', a.id,
            'body', a.body,
            'date', a.date_written,
            'answerer_name', a.answer_name,
            'helpfullness', a.helpful,
            'photos', json_build_array(json_build_object(
              'id', p.id,
              'url', p.url
            )))))))
       FROM questions q
       INNER JOIN answers a on a.question_id = q.id
       INNER JOIN photos p on p.answer_id = a.id
       WHERE q.product_id = $1 and q.reported = 0
    LIMIT $2::int OFFSET $3::int`
    , [product_id, count, page], (err, result) => {
      if (err) {
        console.log(err, 'err')
        res.send('err', 400)
      } else {
        res.send(result.rows[0]['json_build_object'])
      }
    })
})

app.get('/qa/questions/:question_id/answers',(req, res) => {
  var { question_id, count = 5, page = 0 } = req.query;
  pool.query(
    `
    WITH answersTable AS (
      SELECT id a_id, question_id, body, date_written, answer_name, answer_email, reported, helpful
      FROM answers
      WHERE question_id = $1 AND reported = 0
    ), photoTable AS (
      SELECT * FROM answersTable
      LEFT JOIN photos
      ON answersTable.a_id = photos.answer_id
      AND question_id = $1
    ), photoArray as (
      SELECT a_id aa_id, json_agg(json_strip_nulls(json_build_object(
        'id', photoTable.id,
        'url', photoTable.url
      ))) AS all_photos
      FROM photoTable
      GROUP BY a_id
    ), buildObj as (
      SELECT DISTINCT ON (a_id)
      a_id answer_id, body, date_written date, answer_name, helpful helpfulness, all_photos photos
      FROM photoTable
      LEFT JOIN photoArray
      ON photoTable.a_id = photoArray.aa_id)

    SELECT json_build_object(
      'question', $1::int,
      'page', $3::int,
      'count', $2::int,
      'results', json_agg(buildObj)
    )
    FROM buildObj
    LIMIT $2::int;
    `
, [question_id, count, page], (err, result) => {
      if (err) {
        console.log(err, 'err')
        res.status(400).send('err')
      } else {
        res.send(result.rows[0]['json_build_object'])
      }
    }
  )
})






app.listen(port, () => {
  console.log(`listening on PORT ${port}`)
})