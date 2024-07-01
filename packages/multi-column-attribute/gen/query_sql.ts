import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const getBugsByOneTagQuery = `-- name: getBugsByOneTag :many
SELECT b.bug_id, b.status, t.tag FROM Bugs AS b INNER JOIN Tags AS t USING (bug_id) WHERE tag = $1`;

export interface getBugsByOneTagArgs {
    tag: string;
}

export interface getBugsByOneTagRow {
    bugId: number;
    status: string;
    tag: string;
}

export async function getBugsByOneTag(client: Client, args: getBugsByOneTagArgs): Promise<getBugsByOneTagRow[]> {
    const result = await client.query({
        text: getBugsByOneTagQuery,
        values: [args.tag],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            bugId: row[0],
            status: row[1],
            tag: row[2]
        };
    });
}

export const getBugsByMultiTagsQuery = `-- name: getBugsByMultiTags :many
SELECT b.bug_id, b.status, t1.tag AS tag1, t2.tag AS tag2 FROM Bugs AS b
  INNER JOIN Tags AS t1 USING (bug_id)
  INNER JOIN Tags AS t2 USING (bug_id)
WHERE t1.tag = $1 and t2.tag = $2`;

export interface getBugsByMultiTagsArgs {
    tag1: string;
    tag2: string;
}

export interface getBugsByMultiTagsRow {
    bugId: number;
    status: string;
    tag1: string;
    tag2: string;
}

export async function getBugsByMultiTags(client: Client, args: getBugsByMultiTagsArgs): Promise<getBugsByMultiTagsRow[]> {
    const result = await client.query({
        text: getBugsByMultiTagsQuery,
        values: [args.tag1, args.tag2],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            bugId: row[0],
            status: row[1],
            tag1: row[2],
            tag2: row[3]
        };
    });
}

