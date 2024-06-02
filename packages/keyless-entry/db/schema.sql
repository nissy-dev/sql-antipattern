CREATE TABLE Accounts (
  account_id SERIAL,
  username TEXT NOT NULL,
  PRIMARY KEY (account_id)
);

CREATE TABLE Bugs (
  bug_id SERIAL,
  status VARCHAR(20) NOT NULL DEFAULT 'NEW',
  reported_by INTEGER,
  PRIMARY KEY (bug_id),
  FOREIGN KEY (reported_by) REFERENCES Accounts(account_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);
