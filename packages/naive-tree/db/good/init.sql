INSERT INTO Comments (comment_id, comment)
VALUES
  (1, 'Comment1'),
  (2, 'Comment2'),
  (3, 'Comment3'),
  (4, 'Comment4'),
  (5, 'Comment5'),
  (6, 'Comment6'),
  (7, 'Comment7');

INSERT INTO TreePaths (ancestor, descendant)
VALUES
  (1, 1),
  (1, 2),
  (1, 3),
  (1, 4),
  (1, 5),
  (1, 6),
  (1, 7),
  (2, 2),
  (2, 3),
  (3, 3),
  (4, 4),
  (4, 5),
  (4, 6),
  (4, 7),
  (5, 5),
  (6, 6),
  (6, 7),
  (7, 7);
