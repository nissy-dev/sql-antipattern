INSERT INTO Comments (comment_id, parent_id, comment)
VALUES
  (1, NULL, 'Comment1'),
  (2, NULL, 'Comment2'),
  (3, NULL, 'Comment3'),
  (4, 1, 'Comment4'),
  (5, 1, 'Comment5'),
  (6, 4, 'Comment6'),
  (7, 4, 'Comment7'),
  (8, 4, 'Comment8'),
  (9, 2, 'Comment9'),
  (10, 8, 'Comment10');
