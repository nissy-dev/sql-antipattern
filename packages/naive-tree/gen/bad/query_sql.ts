import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const listCommentsQuery = `-- name: ListComments :many
SELECT comment_id, parent_id, comment FROM Comments`;

export interface ListCommentsRow {
    commentId: number;
    parentId: string | null;
    comment: string;
}

export async function listComments(client: Client): Promise<ListCommentsRow[]> {
    const result = await client.query({
        text: listCommentsQuery,
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

