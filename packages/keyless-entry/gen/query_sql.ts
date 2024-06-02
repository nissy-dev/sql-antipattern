import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const getAllAccountsQuery = `-- name: getAllAccounts :many
SELECT account_id, username FROM Accounts`;

export interface getAllAccountsRow {
    accountId: number;
    username: string;
}

export async function getAllAccounts(client: Client): Promise<getAllAccountsRow[]> {
    const result = await client.query({
        text: getAllAccountsQuery,
        values: [],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            accountId: row[0],
            username: row[1]
        };
    });
}

export const getAllBugsQuery = `-- name: getAllBugs :many
SELECT bug_id, status, reported_by FROM Bugs`;

export interface getAllBugsRow {
    bugId: number;
    status: string;
    reportedBy: number | null;
}

export async function getAllBugs(client: Client): Promise<getAllBugsRow[]> {
    const result = await client.query({
        text: getAllBugsQuery,
        values: [],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            bugId: row[0],
            status: row[1],
            reportedBy: row[2]
        };
    });
}

export const deleteAccountsQuery = `-- name: deleteAccounts :exec
DELETE FROM Accounts WHERE account_id = $1`;

export interface deleteAccountsArgs {
    accountId: number;
}

export async function deleteAccounts(client: Client, args: deleteAccountsArgs): Promise<void> {
    await client.query({
        text: deleteAccountsQuery,
        values: [args.accountId],
        rowMode: "array"
    });
}

export const updateAccountIdQuery = `-- name: updateAccountId :exec
UPDATE Accounts SET account_id = $1 WHERE account_id = $2`;

export interface updateAccountIdArgs {
    newId: number;
    accountId: number;
}

export async function updateAccountId(client: Client, args: updateAccountIdArgs): Promise<void> {
    await client.query({
        text: updateAccountIdQuery,
        values: [args.newId, args.accountId],
        rowMode: "array"
    });
}

