-- i.issue_id = b.issue_id などは USING で簡略化できる
-- name: getAllData :many
SELECT i.*, b.severity, f.sponsor FROM Issues as i
  LEFT OUTER JOIN Bugs as b USING (issue_id)
  LEFT OUTER JOIN Features as f USING (issue_id);
