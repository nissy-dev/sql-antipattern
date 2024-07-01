CREATE TABLE Accounts (
  account_id SERIAL,
  username TEXT NOT NULL,
  PRIMARY KEY (account_id)
);

CREATE TABLE Bugs (
  issue_id SERIAL,
  status VARCHAR(20) NOT NULL DEFAULT 'NEW',
  assigned_to INTEGER,
  PRIMARY KEY (issue_id),
  FOREIGN KEY (assigned_to) REFERENCES Accounts(account_id)
);
