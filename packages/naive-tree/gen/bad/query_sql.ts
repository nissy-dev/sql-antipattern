import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const getAllCommentsQuery = `-- name: getAllComments :many
SELECT comment_id, parent_id, comment FROM Comments`;

export interface getAllCommentsRow {
    commentId: number;
    parentId: number | null;
    comment: string;
}

export async function getAllComments(client: Client): Promise<getAllCommentsRow[]> {
    const result = await client.query({
        text: getAllCommentsQuery,
        values: [],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            commentId: row[0],
            parentId: row[1],
            comment: row[2]
        };
    });
}

export const getParentIdQuery = `-- name: getParentId :one
SELECT parent_id FROM Comments WHERE comment_id = $1`;

export interface getParentIdArgs {
    commentId: number;
}

export interface getParentIdRow {
    parentId: number | null;
}

export async function getParentId(client: Client, args: getParentIdArgs): Promise<getParentIdRow | null> {
    const result = await client.query({
        text: getParentIdQuery,
        values: [args.commentId],
        rowMode: "array"
    });
    if (result.rows.length !== 1) {
        return null;
    }
    const row = result.rows[0];
    return {
        parentId: row[0]
    };
}

export const updateParentIdQuery = `-- name: updateParentId :exec
UPDATE Comments SET parent_id = $1 WHERE parent_id = $2`;

export interface updateParentIdArgs {
    updateId: number | null;
    parentId: number | null;
}

export async function updateParentId(client: Client, args: updateParentIdArgs): Promise<void> {
    await client.query({
        text: updateParentIdQuery,
        values: [args.updateId, args.parentId],
        rowMode: "array"
    });
}

export const deleteCommentQuery = `-- name: deleteComment :exec
DELETE FROM Comments WHERE comment_id = $1`;

export interface deleteCommentArgs {
    commentId: number;
}

export async function deleteComment(client: Client, args: deleteCommentArgs): Promise<void> {
    await client.query({
        text: deleteCommentQuery,
        values: [args.commentId],
        rowMode: "array"
    });
}

export const getCommentTreeQuery = `-- name: getCommentTree :many
WITH RECURSIVE CommentTree
  (comment_id, parent_id, comment, depth)
AS (
  SELECT comment_id, parent_id, comment, 0 as depth FROM Comments WHERE parent_id IS NULL
UNION ALL
  SELECT c.comment_id, c.parent_id, c.comment, ct.depth+1 FROM CommentTree as ct
  INNER JOIN Comments as c ON ct.comment_id = c.parent_id
)
SELECT comment_id, parent_id, comment, depth FROM CommentTree`;

export interface getCommentTreeRow {
    commentId: number;
    parentId: number | null;
    comment: string;
    depth: string;
}

export async function getCommentTree(client: Client): Promise<getCommentTreeRow[]> {
    const result = await client.query({
        text: getCommentTreeQuery,
        values: [],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            commentId: row[0],
            parentId: row[1],
            comment: row[2],
            depth: row[3]
        };
    });
}

