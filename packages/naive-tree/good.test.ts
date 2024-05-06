import fs from "node:fs";
import { Client } from "pg";
import dedent from "dedent";
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
import * as query from "./gen/good/query_sql";
import { a } from "vitest/dist/suite-IbNSsUWN.js";

describe("good case", () => {
  let container: StartedTestContainer | null = null;
  let client: Client | null = null;

  beforeAll(async () => {
    container = await new GenericContainer("postgres:latest")
      .withEnvironment({
        POSTGRES_DB: "naive_tree_good",
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
      database: "naive_tree_good",
      user: "postgres",
      password: "password",
    });
    await client.connect();

    // スキーマの初期化
    const schemaSQL = fs.readFileSync("db/good/schema.sql", "utf-8");
    await client.query(schemaSQL);

    // テストデータの初期化
    const initSQL = fs.readFileSync("db/good/init.sql", "utf-8");
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

  test("あるコメントに紐づくすべてのコメントを取得", async () => {
    const comments = await query.getCommentsByAncestorId(client!, {
      ancestor: 4,
    });
    console.table(comments);
  });

  test("サブツリー全体の削除", async () => {
    const ids = await query.getDescendantIdsByAncestorId(client!, {
      ancestor: 6,
    });
    await query.deleteSubTreesByDescendantId(client!, {
      descendantIds: ids.map((row) => row.descendant),
    });
    const comments = await query.getCommentsByAncestorId(client!, {
      ancestor: 4,
    });
    console.table(comments);
  });

  test("サブツリー全体の削除", async () => {
    const ids = await query.getDescendantIdsByAncestorId(client!, {
      ancestor: 6,
    });
    await query.deleteSubTreesByDescendantId(client!, {
      descendantIds: ids.map((row) => row.descendant),
    });
    const comments = await query.getCommentsByAncestorId(client!, {
      ancestor: 4,
    });
    console.table(comments);
  });

  test("サブツリーの移動", async () => {
    // まずはサブツリーを削除する
    // ここはうまく sqlc がクエリを生成できなかった
    await client!.query(dedent`
      DELETE FROM TreePaths
      WHERE
        descendant IN (SELECT x.id FROM (SELECT descendant AS id FROM TreePaths WHERE ancestor = 6) AS x)
      AND
        ancestor IN (SELECT y.id FROM (SELECT ancestor AS id FROM TreePaths WHERE descendant = 6 AND ancestor != descendant) AS y);
    `);

    // サブツリーを移動する
    await query.moveSubTrees(client!, { descendant: 3, ancestor: 6 });
    const comments = await query.getCommentsByAncestorId(client!, {
      ancestor: 3,
    });
    console.table(comments);
  });
});
