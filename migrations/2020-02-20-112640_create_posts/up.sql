CREATE TABLE posts (
                       id SERIAL PRIMARY KEY,
                       author VARCHAR(100) NOT NULL,
                       body TEXT NOT NULL,
                       published_at TIMESTAMP NOT NULL
)