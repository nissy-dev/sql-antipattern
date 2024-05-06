-- name: getAllComments :many
SELECT * FROM Comments;

-- name: getParentId :one
SELECT parent_id FROM Comments WHERE comment_id = $1;

-- name: updateParentId :exec
UPDATE Comments SET parent_id = sqlc.arg(update_id) WHERE parent_id = sqlc.arg(parent_id);

-- name: deleteComment :exec
DELETE FROM Comments WHERE comment_id = $1;

-- name: getCommentTree :many
WITH RECURSIVE CommentTree
  (comment_id, parent_id, comment, depth)
AS (
  SELECT *, 0 as depth FROM Comments WHERE parent_id IS NULL
UNION ALL
  SELECT c.*, ct.depth+1 FROM CommentTree as ct
  INNER JOIN Comments as c ON ct.comment_id = c.parent_id
)
SELECT comment_id, parent_id, comment, depth FROM CommentTree;
