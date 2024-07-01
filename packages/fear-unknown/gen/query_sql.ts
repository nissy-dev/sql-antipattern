import { QueryArrayConfig, QueryArrayResult } from "pg";

interface Client {
    query: (config: QueryArrayConfig) => Promise<QueryArrayResult>;
}

export const getBugCommentsByIdQuery = `-- name: getBugCommentsById :many
SELECT b.issue_id, c.comment_id, c.comment FROM BugsComments AS b
INNER JOIN Comments AS c USING (comment_id) WHERE b.issue_id = $1`;

export interface getBugCommentsByIdArgs {
    issueId: number;
}

export interface getBugCommentsByIdRow {
    issueId: number;
    commentId: number;
    comment: string;
}

export async function getBugCommentsById(client: Client, args: getBugCommentsByIdArgs): Promise<getBugCommentsByIdRow[]> {
    const result = await client.query({
        text: getBugCommentsByIdQuery,
        values: [args.issueId],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            issueId: row[0],
            commentId: row[1],
            comment: row[2]
        };
    });
}

export const getRelatedIssueByCommentIdsQuery = `-- name: getRelatedIssueByCommentIds :many
SELECT
  c.comment_id,
  b.issue_id AS bug_id,
  b.status,
  b.reported_by,
  f.title,
  f.issue_id AS feature_id
FROM Comments AS c
LEFT OUTER JOIN (
  BugsComments INNER JOIN Bugs AS b USING (issue_id)
) USING (comment_id)
LEFT OUTER JOIN (
  FeaturesComments INNER JOIN Features AS f USING (issue_id)
) USING (comment_id)
WHERE c.comment_id = $1`;

export interface getRelatedIssueByCommentIdsArgs {
    commentId: number;
}

export interface getRelatedIssueByCommentIdsRow {
    commentId: number;
    bugId: number;
    status: string;
    reportedBy: number | null;
    title: string;
    featureId: number;
}

export async function getRelatedIssueByCommentIds(client: Client, args: getRelatedIssueByCommentIdsArgs): Promise<getRelatedIssueByCommentIdsRow[]> {
    const result = await client.query({
        text: getRelatedIssueByCommentIdsQuery,
        values: [args.commentId],
        rowMode: "array"
    });
    return result.rows.map(row => {
        return {
            commentId: row[0],
            bugId: row[1],
            status: row[2],
            reportedBy: row[3],
            title: row[4],
            featureId: row[5]
        };
    });
}

