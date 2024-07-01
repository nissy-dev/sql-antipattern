CREATE TABLE Bugs (
  bug_id SERIAL,
  status VARCHAR(20) NOT NULL DEFAULT 'NEW',
  PRIMARY KEY (bug_id)
);

CREATE TABLE Tags (
  bug_id SERIAL,
  tag VARCHAR(20),
  PRIMARY KEY (bug_id, tag),
  FOREIGN KEY (bug_id) REFERENCES Bugs(bug_id)
);
