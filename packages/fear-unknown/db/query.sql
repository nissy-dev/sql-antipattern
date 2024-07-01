-- name: getBugsNotAssignedTo :many
SELECT * FROM Bugs WHERE assigned_to <> $1;
