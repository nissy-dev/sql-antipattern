INSERT INTO Accounts (account_id, username)
VALUES
  (1, 'Account1'),
  (2, 'Account2');

INSERT INTO Bugs (issue_id, status, reported_by)
VALUES
  (1, 'NEW', 1),
  (2, 'UPDATE', 1),
  (3, 'NEW', 2);

INSERT INTO Features (issue_id, title)
VALUES
  (1, 'Feature1'),
  (2, 'Feature2'),
  (3, 'Feature3');

INSERT INTO Comments (comment_id, comment)
VALUES
  (1, 'Comment1'),
  (2, 'Comment2'),
  (3, 'Comment3'),
  (4, 'Comment4'),
  (5, 'Comment5'),
  (6, 'Comment6');

INSERT INTO BugsComments (issue_id, comment_id)
VALUES
  (1, 1),
  (1, 2),
  (2, 3);

INSERT INTO FeaturesComments (issue_id, comment_id)
VALUES
  (1, 4),
  (3, 5);
