import http from 'k6/http';
import {randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';
import { URL } from 'https://jslib.k6.io/url/1.0.0/index.js';
import { sleep } from 'k6';



export const options = {
  stages: [
    { duration: '10s', target: 100 }, // below normal load
    { duration: '20s', target: 100 },
    { duration: '10s', target: 200 }, // normal load
    { duration: '10s', target: 200 },
    { duration: '10s', target: 300 }, // around the breaking point
    { duration: '10s', target: 300 },
    { duration: '10s', target: 400 }, // beyond the breaking point
    { duration: '10s', target: 400 },
    { duration: '20s', target: 0 }, // scale down. Recovery stage.
  ],
};


export default function () {
  const getQuestionsURL =  new URL('http://localhost:8000/qa/questions');
  getQuestionsURL.searchParams.append('product_id', randomIntBetween(1, 1000000));
  http.get(getQuestionsURL.toString());
}

