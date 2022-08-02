import http from 'k6/http';
import {randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';
import { URL } from 'https://jslib.k6.io/url/1.0.0/index.js';
import { sleep } from 'k6';



export const options = {
  scenarios: {
    constant_request_rate: {
      executor: 'constant-arrival-rate',
      rate: 100,
      timeUnit: '1s', // 1000 iterations per second, i.e. 1000 RPS
      duration: '30s',
      preAllocatedVUs: 100, // how large the initial pool of VUs would be
      maxVUs: 200, // if the preAllocatedVUs are not enough, we can initialize more
    },
  },
};


export default function () {
  const getQuestionsURL =  new URL('http://localhost:8000/qa/questions');
  getQuestionsURL.searchParams.append('product_id', randomIntBetween(1, 1000000));
  http.get(getQuestionsURL.toString());
}

