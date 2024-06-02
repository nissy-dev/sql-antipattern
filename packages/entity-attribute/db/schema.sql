CREATE TABLE Issues (
  issue_id SERIAL,
  priority VARCHAR(20),
  PRIMARY KEY (issue_id)
);

CREATE TABLE Bugs (
  issue_id INTEGER,
  severity VARCHAR(20),
  PRIMARY KEY (issue_id),
  FOREIGN KEY (issue_id) REFERENCES Issues(issue_id)
);

CREATE TABLE Features (
  issue_id INTEGER,
  sponsor VARCHAR(20),
  PRIMARY KEY (issue_id),
  FOREIGN KEY (issue_id) REFERENCES Issues(issue_id)
);
