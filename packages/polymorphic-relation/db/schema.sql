CREATE TABLE Accounts (
  account_id SERIAL,
  username TEXT NOT NULL,
  PRIMARY KEY (account_id)
);

CREATE TABLE Bugs (
  issue_id SERIAL,
  status VARCHAR(20) NOT NULL DEFAULT 'NEW',
  reported_by INTEGER,
  PRIMARY KEY (issue_id),
  FOREIGN KEY (reported_by) REFERENCES Accounts(account_id)
);

CREATE TABLE Features (
  issue_id SERIAL,
  title TEXT NOT NULL,
  PRIMARY KEY (issue_id)
);

CREATE TABLE Comments (
  comment_id SERIAL,
  comment TEXT NOT NULL,
  PRIMARY KEY (comment_id)
);

CREATE TABLE BugsComments(
  issue_id INTEGER,
  comment_id INTEGER,
  UNIQUE (comment_id),
  PRIMARY KEY (issue_id, comment_id),
  FOREIGN KEY (issue_id) REFERENCES Bugs(issue_id),
  FOREIGN KEY (comment_id) REFERENCES Comments(comment_id)
);

CREATE TABLE FeaturesComments(
  issue_id INTEGER,
  comment_id INTEGER,
  UNIQUE (comment_id),
  PRIMARY KEY (issue_id, comment_id),
  FOREIGN KEY (issue_id) REFERENCES Features(issue_id),
  FOREIGN KEY (comment_id) REFERENCES Comments(comment_id)
);
