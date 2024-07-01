-- name: getBugsByOneTag :many
SELECT b.*, t.tag FROM Bugs AS b INNER JOIN Tags AS t USING (bug_id) WHERE tag = $1;

-- name: getBugsByMultiTags :many
SELECT b.*, t1.tag AS tag1, t2.tag AS tag2 FROM Bugs AS b
  INNER JOIN Tags AS t1 USING (bug_id)
  INNER JOIN Tags AS t2 USING (bug_id)
WHERE t1.tag = sqlc.arg(tag1) and t2.tag = sqlc.arg(tag2);
