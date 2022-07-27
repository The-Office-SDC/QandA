DROP DATABASE IF EXISTS questionsandanswers;
CREATE DATABASE questionsandanswers;


\c questionsandanswers;

CREATE TABLE questions (
   id SERIAL PRIMARY KEY,
   product_id INT NOT NULL,
   body TEXT NOT NULL,
   date_written BIGINT NOT NULL,
   ask_name TEXT NOT NULL,
   ask_email TEXT,
   reported INT DEFAULT 0,
   helpful INT DEFAULT 0
);

CREATE TABLE answers (
   id SERIAL PRIMARY KEY,
   question_id INT NOT NULL,
   body TEXT NOT NULL,
   date_written BIGINT NOT NULL,
   answer_name TEXT NOT NULL,
   answer_email TEXT,
   reported INT DEFAULT 0,
   helpful INT DEFAULT 0
);

CREATE TABLE photos (
   id SERIAL PRIMARY KEY,
   answer_id INT NOT NULL,
   url TEXT
);

\COPY questions FROM './data/questions.csv' csv header;
\COPY answers FROM './data/answers.csv' csv header;
\COPY photos FROM './data/answers_photos.csv' csv header;