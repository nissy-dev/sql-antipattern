CREATE TABLE Comments (
  comment_id SERIAL,
  parent_id INTEGER,
  comment TEXT NOT NULL,
  PRIMARY KEY (comment_id),
  FOREIGN KEY (parent_id) REFERENCES Comments(comment_id)
);

CREATE TABLE TreePaths (
  ancestor INTEGER,
  descendant INTEGER,
  PRIMARY KEY (ancestor, descendant),
  FOREIGN KEY (ancestor) REFERENCES Comments(comment_id),
  FOREIGN KEY (descendant) REFERENCES Comments(comment_id)
);
