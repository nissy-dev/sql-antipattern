-- name: getCommentsByAncestorId :many
SELECT c.* FROM Comments AS c
INNER JOIN TreePaths AS t ON c.comment_id = t.descendant WHERE t.ancestor = $1;

-- name: getDescendantIdsByAncestorId :many
SELECT descendant FROM TreePaths WHERE ancestor = $1;

-- name: getAncestorIdsByDescendantId :many
SELECT ancestor FROM TreePaths WHERE descendant = $1;

-- name: deleteSubTreesByDescendantId :exec
DELETE FROM TreePaths WHERE descendant = ANY(@descendant_ids::INTEGER[]);

-- 引数を使おうとするとエラーになる
-- name: deleteSubTreesById :exec
DELETE FROM TreePaths
WHERE
  descendant IN (SELECT x.id FROM (SELECT descendant AS id FROM TreePaths WHERE ancestor = $1) AS x)
AND
  ancestor IN (SELECT y.id FROM (SELECT ancestor AS id FROM TreePaths WHERE descendant = $2 AND ancestor != descendant) AS y);

-- name: moveSubTrees :exec
INSERT INTO TreePaths (ancestor, descendant)
  SELECT supertree.ancestor, subtree.descendant FROM TreePaths AS supertree
    CROSS JOIN TreePaths AS subtree
  WHERE supertree.descendant = $1 AND subtree.ancestor = $2;
