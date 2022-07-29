const pool = require('../../database/db.js');

module.exports = function returnQuestions(product_id, count = 5, page = 1) {
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
            ))
          )
        )
      )
      ))
       FROM questions q
       INNER JOIN answers a on a.question_id = q.id
       INNER JOIN photos p on p.answer_id = a.id
       WHERE q.product_id = $1 and q.reported = 0


    LIMIT $2::int OFFSET $3::int`

    , [product_id, count, page], (err, result) => {
      if (err) {
        console.log(err, 'err')
        res.send(err)
      } else {
        console.log(result.rows[0]['json_build_object'])
        res.send(result.rows[0]['json_build_object'])
      }
    })
}