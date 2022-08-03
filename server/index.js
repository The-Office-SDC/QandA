const express = require('express');
const pool = require('../database/db.js');
const returnQuestions = require('./models/questions.js')
require('dotenv').config();
const app = express();
app.use(express.json());



const port = process.env.EXPRESS_PORT || 3000;

var getDate = function() {
  var date = Date.now();
  return date;
 }


app.get('/qa/questions', (req, res) => {
  var { product_id, count = 5, page = 0 } = req.query;
  pool.query(

    `SELECT json_build_object(
      'product_id', $1::int,
      'results', json_agg(json_build_object(
        'question_id', q.id,
        'questions_body', q.body,
        'question_date', to_timestamp(q.date_written::bigint/1000),
        'asker_name', q.ask_name,
        'question_helpfulness', q.helpful,
        'reported', q.reported,
        'answers', json_build_object(
          a.id, json_build_object(
            'id', a.id,
            'body', a.body,
            'date', to_timestamp(a.date_written::bigint/1000),
            'answerer_name', a.answer_name,
            'helpfullness', a.helpful,
            'photos', json_build_array(json_build_object(
              'id', p.id,
              'url', p.url
            )))))))
       FROM questions q
       LEFT JOIN answers a on a.question_id = q.id
       INNER JOIN photos p on p.answer_id = a.id
       WHERE q.product_id = $1 and q.reported = 0
       LIMIT $2::int OFFSET $3::int`
    , [product_id, count, page], (err, result) => {
      if (err) {
        res.send('err', 400)
      } else {
        if(result.rows[0]) {
          res.status(200).send(result.rows[0]['json_build_object'])
        } else res.status(404).send('not found')
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
      LIMIT $2::int
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
      a_id answer_id, body, to_timestamp(date_written::bigint/1000) date, answer_name, helpful helpfulness, all_photos photos
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
        res.status(400).send('err')
      } else {
        if(result.rows[0]['json_build_object']) {
          res.status(200).send(result.rows[0]['json_build_object'])
        } else res.status(404).send('not found')

      }
    }
  )
})

app.post('/qa/questions', (req, res) => {
 var { body, name, email, product_id } = req.body
 var getDate = function() {
  var date = Date.now();
  return date;
 }
  pool.query(
    `INSERT INTO questions (product_id, body, date_written, ask_name, ask_email)
    VALUES ($4::int, $1::text, ${getDate()}, $2::text, $3::text)`, [body, name, email, product_id], (err, result) => {
      if (err) {
        console.log(err)
        res.status(400).send('err')
      } else {
        res.status(201).send();
      }
    }
  )
})

app.post('/qa/questions/:question_id/answers', (req, res) => {
  var { body, name, email, photos} = req.body;
  var { question_id } = req.query;
  pool.query(
    `INSERT INTO answers (question_id, body, date_written, answer_name, answer_email)
    VALUES ($4::int, $1::text, ${getDate()}, $2::text, $3::text) RETURNING id`, [body, name, email, question_id], (err, result) => {
      if (err) {
        console.log(err)
        res.status(400).send()
      } else {
        console.log(result.rows[0].id)
        if (photos.length > 0) {
          photos.forEach((photo) => {
            console.log(photo)
            pool.query(
              `INSERT INTO photos (answer_id, url)
              VALUES (${result.rows[0].id}, '${photo}')`, null, (err, result) => {
                if (err) {
                  console.log(err)
                } else {
                  res.status(201).send();
                }
              }
            )
          })
        } else {
          res.status(201).send();
        }
      }
    }
  )
})

app.put('/qa/questions/:question_id/helpful', (req, res) => {
  var { question_id } = req.query;
  pool.query(
    `UPDATE questions
    SET helpful = helpful + 1
    WHERE id = $1`, [question_id], (err, result) => {
      if (err) {
        console.log(err);
        res.status(400).send();
      } else {
        res.status(204).send();
      }
    }
  )
})

app.put('/qa/questions/:question_id/report', (req, res) => {
  var { question_id } = req.query;
  pool.query(
    `UPDATE questions
    SET reported = reported + 1
    WHERE id = $1`, [question_id], (err, result) => {
      if (err) {
        console.log(err);
        res.status(400).send();
      } else {
        res.status(204).send();
      }
    }
  )
})

app.put('/qa/answers/:answer_id/helpful', (req, res) => {
  var { answer_id } = req.query;
  pool.query(
    `UPDATE answers
    SET helpful = helpful + 1
    WHERE id = $1`, [answer_id], (err, result) => {
      if (err) {
        console.log(err);
        res.status(400).send();
      } else {
        res.status(204).send();
      }
    }
  )
})

app.put('/qa/answers/:answer_id/report', (req, res) => {
  var { answer_id } = req.query;
  pool.query(
    `UPDATE answers
    SET reported = reported + 1
    WHERE id = $1`, [answer_id], (err, result) => {
      if (err) {
        console.log(err);
        res.status(400).send();
      } else {
        res.status(204).send();
      }
    }
  )
})

app.get('/loaderio-75989140c8fdc3a4b82f2b374e4c60c7', (req, res) => {
  re.status(200).send('loaderio-75989140c8fdc3a4b82f2b374e4c60c7')
})








app.listen(port, () => {
  console.log(`listening on PORT ${port}`)
})