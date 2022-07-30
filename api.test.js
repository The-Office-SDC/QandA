const request = require('supertest')('localhost:8000');
const expect = require('chai').expect;

describe('GET /qa/questions', () => {
  var res;
  before(async ()=> {
    res = await request.get('/qa/questions').query({product_id: 1})})
  it('returns a status code of 200', ()=> {
    expect(res.status).to.equal(200);
  })
  it('should return the given product_id value (1)', ()=> {
    expect(res.body.product_id).to.equal(1)
  })
})

describe('GET /qa/questions/:question_id/answers', ()=> {
  var question_id = 5
  var res;
  before(async ()=> {
    res = await request.get('/qa/questions/:question_id/answers').query({question_id: question_id})
  })
  it('returns a status code of 200', ()=> {
    expect(res.status).to.equal(200)
  })
  it('should return the given question_id value (5)', () => {
    expect(res.body.question).to.equal(question_id)
  })
})

