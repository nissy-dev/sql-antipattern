-- name: getAllAccounts :many
SELECT * FROM Accounts;

-- name: getAllBugs :many
SELECT * FROM Bugs;

-- name: deleteAccounts :exec
DELETE FROM Accounts WHERE account_id = $1;

-- name: updateAccountId :exec
UPDATE Accounts SET account_id = sqlc.arg(new_id) WHERE account_id = sqlc.arg(account_id);
