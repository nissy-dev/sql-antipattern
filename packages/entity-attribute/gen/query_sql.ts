import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const getAllDataQuery = `-- name: getAllData :many
SELECT i.issue_id, i.priority, b.severity, f.sponsor FROM Issues as i
  LEFT OUTER JOIN Bugs as b USING (issue_id)
  LEFT OUTER JOIN Features as f USING (issue_id)`;

export interface getAllDataRow {
    issueId: number;
    priority: string | null;
    severity: string | null;
    sponsor: string | null;
}

export async function getAllData(client: Client): Promise<getAllDataRow[]> {
    const result = await client.query({
        text: getAllDataQuery,
        values: [],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            issueId: row[0],
            priority: row[1],
            severity: row[2],
            sponsor: row[3]
        };
    });
}

