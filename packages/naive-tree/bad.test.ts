import fs from "node:fs";
import { Client } from "pg";
import {
  GenericContainer,
  type StartedTestContainer,
  Wait,
} from "testcontainers";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  test,
} from "vitest";
import * as query from "./gen/bad/query_sql";

describe("bad case", () => {
  let container: StartedTestContainer | null = null;
  let client: Client | null = null;

  beforeAll(async () => {
    container = await new GenericContainer("postgres:latest")
      .withEnvironment({
        POSTGRES_DB: "naive_tree_bad",
        POSTGRES_USER: "postgres",
        POSTGRES_PASSWORD: "password",
      })
      .withExposedPorts(5432)
      // TCPポートが利用可能になるまで待機
      .withWaitStrategy(Wait.forListeningPorts())
      .start();

    client = new Client({
      host: container.getHost(),
      port: container.getMappedPort(5432),
      database: "naive_tree_bad",
      user: "postgres",
      password: "password",
    });
    await client.connect();

    // スキーマの初期化
    const schemaSQL = fs.readFileSync("db/bad/schema.sql", "utf-8");
    await client.query(schemaSQL);

    // テストデータの初期化
    const initSQL = fs.readFileSync("db/bad/init.sql", "utf-8");
    await client.query(initSQL);
  });

  afterAll(async () => {
    await client?.end();
    await container?.stop();
  });

  beforeEach(async () => {
    await client?.query("BEGIN;");
  });

  afterEach(async () => {
    await client?.query("ROLLBACK;");
  });

  test("再帰的にコメントツリーを取得する", async () => {
    const comments = await query.getCommentTree(client!);
    console.table(comments);
  });

  test("コメントツリーの中間ノードの更新", async () => {
    // 削除対象のコメントの親IDを取得
    const deleteCommentId = 8;
    const row = await query.getParentId(client!, {
      commentId: deleteCommentId,
    });
    if (!row || row.parentId === null) {
      throw new Error("Parent ID not found");
    }
    // 削除対象のコメントの親IDを更新
    await query.updateParentId(client!, {
      updateId: row.parentId,
      parentId: deleteCommentId,
    });
    // コメントの削除
    await query.deleteComment(client!, { commentId: deleteCommentId });

    // コメントツリーの確認
    const comments = await query.getCommentTree(client!);
    console.table(comments);
  });
});
