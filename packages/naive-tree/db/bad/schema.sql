CREATE TABLE Comments (
  comment_id SERIAL,
  parent_id INTEGER,
  comment TEXT NOT NULL,
  PRIMARY KEY (comment_id),
  FOREIGN KEY (parent_id) REFERENCES Comments(comment_id)
);
