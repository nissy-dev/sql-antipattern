import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
  query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const getCommentsByAncestorIdQuery = `-- name: getCommentsByAncestorId :many
SELECT c.comment_id, c.parent_id, c.comment FROM Comments AS c
INNER JOIN TreePaths AS t ON c.comment_id = t.descendant WHERE t.ancestor = $1`;

export interface getCommentsByAncestorIdArgs {
  ancestor: number;
}

export interface getCommentsByAncestorIdRow {
  commentId: number;
  parentId: number | null;
  comment: string;
}

export async function getCommentsByAncestorId(
  client: Client,
  args: getCommentsByAncestorIdArgs
): Promise<getCommentsByAncestorIdRow[]> {
  const result = await client.query({
    text: getCommentsByAncestorIdQuery,
    values: [args.ancestor],
    rowMode: "array",
  });
  return result.rows.map((row) => {
    return {
      commentId: row[0],
      parentId: row[1],
      comment: row[2],
    };
  });
}

export const getDescendantIdsByAncestorIdQuery = `-- name: getDescendantIdsByAncestorId :many
SELECT descendant FROM TreePaths WHERE ancestor = $1`;

export interface getDescendantIdsByAncestorIdArgs {
  ancestor: number;
}

export interface getDescendantIdsByAncestorIdRow {
  descendant: number;
}

export async function getDescendantIdsByAncestorId(
  client: Client,
  args: getDescendantIdsByAncestorIdArgs
): Promise<getDescendantIdsByAncestorIdRow[]> {
  const result = await client.query({
    text: getDescendantIdsByAncestorIdQuery,
    values: [args.ancestor],
    rowMode: "array",
  });
  return result.rows.map((row) => {
    return {
      descendant: row[0],
    };
  });
}

export const getAncestorIdsByDescendantIdQuery = `-- name: getAncestorIdsByDescendantId :many
SELECT ancestor FROM TreePaths WHERE descendant = $1`;

export interface getAncestorIdsByDescendantIdArgs {
  descendant: number;
}

export interface getAncestorIdsByDescendantIdRow {
  ancestor: number;
}

export async function getAncestorIdsByDescendantId(
  client: Client,
  args: getAncestorIdsByDescendantIdArgs
): Promise<getAncestorIdsByDescendantIdRow[]> {
  const result = await client.query({
    text: getAncestorIdsByDescendantIdQuery,
    values: [args.descendant],
    rowMode: "array",
  });
  return result.rows.map((row) => {
    return {
      ancestor: row[0],
    };
  });
}

export const deleteSubTreesByDescendantIdQuery = `-- name: deleteSubTreesByDescendantId :exec
DELETE FROM TreePaths WHERE descendant = ANY($1::INTEGER[])`;

export interface deleteSubTreesByDescendantIdArgs {
  descendantIds: number[];
}

export async function deleteSubTreesByDescendantId(
  client: Client,
  args: deleteSubTreesByDescendantIdArgs
): Promise<void> {
  await client.query({
    text: deleteSubTreesByDescendantIdQuery,
    values: [args.descendantIds],
    rowMode: "array",
  });
}

export const deleteSubTreesByIdQuery = `-- name: deleteSubTreesById :exec
DELETE FROM TreePaths
WHERE
  descendant IN (SELECT x.id FROM (SELECT descendant AS id FROM TreePaths WHERE ancestor = @id) AS x)
AND
  ancestor IN (SELECT y.id FROM (SELECT ancestor AS id FROM TreePaths WHERE descendant = @id AND ancestor != descendant) AS y)`;

export interface deleteSubTreesByIdArgs {
  id: string;
}

export async function deleteSubTreesById(
  client: Client,
  args: deleteSubTreesByIdArgs
): Promise<void> {
  await client.query({
    text: deleteSubTreesByIdQuery,
    values: [args.id],
    rowMode: "array",
  });
}

export const moveSubTreesQuery = `-- name: moveSubTrees :exec
INSERT INTO TreePaths (ancestor, descendant)
  SELECT supertree.ancestor, subtree.descendant FROM TreePaths AS supertree
    CROSS JOIN TreePaths AS subtree
  WHERE supertree.descendant = $1 AND subtree.ancestor = $2`;

export interface moveSubTreesArgs {
  descendant: number;
  ancestor: number;
}

export async function moveSubTrees(
  client: Client,
  args: moveSubTreesArgs
): Promise<void> {
  await client.query({
    text: moveSubTreesQuery,
    values: [args.descendant, args.ancestor],
    rowMode: "array",
  });
}
