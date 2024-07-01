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
import * as query from "./gen/query_sql";

describe("playground", () => {
  let container: StartedTestContainer | null = null;
  let client: Client | null = null;

  beforeAll(async () => {
    container = await new GenericContainer("postgres:latest")
      .withEnvironment({
        POSTGRES_DB: "polymorphic_relation",
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
      database: "polymorphic_relation",
      user: "postgres",
      password: "password",
    });
    await client.connect();

    // スキーマの初期化
    const schemaSQL = fs.readFileSync("db/schema.sql", "utf-8");
    await client.query(schemaSQL);

    // テストデータの初期化
    const initSQL = fs.readFileSync("db/init.sql", "utf-8");
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

  test("クエリの確認", async () => {
    const bugComments = await query.getBugCommentsById(client!, {
      issueId: 1,
    });
    console.log("issue_id = 1 コメント:");
    // 複数のコメントが取得される
    console.table(bugComments);

    const bugs = await query.getRelatedIssueByCommentIds(client!, {
      commentId: 3,
    });
    console.table(bugs);
    const features = await query.getRelatedIssueByCommentIds(client!, {
      commentId: 5,
    });
    console.table(features);
  });
});
