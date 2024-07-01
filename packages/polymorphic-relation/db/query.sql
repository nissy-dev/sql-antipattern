-- name: getBugCommentsById :many
SELECT b.issue_id, c.comment_id, c.comment FROM BugsComments AS b
INNER JOIN Comments AS c USING (comment_id) WHERE b.issue_id = $1;

-- name: getRelatedIssueByCommentIds :many
SELECT
  c.comment_id,
  b.issue_id AS bug_id,
  b.status,
  b.reported_by,
  f.title,
  f.issue_id AS feature_id
FROM Comments AS c
LEFT OUTER JOIN (
  BugsComments INNER JOIN Bugs AS b USING (issue_id)
) USING (comment_id)
LEFT OUTER JOIN (
  FeaturesComments INNER JOIN Features AS f USING (issue_id)
) USING (comment_id)
WHERE c.comment_id = $1;
