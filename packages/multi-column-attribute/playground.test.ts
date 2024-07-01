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
        POSTGRES_DB: "multi_column_attribute",
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
      database: "multi_column_attribute",
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
    const bugs = await query.getBugsByOneTag(client!, {
      tag: "Tag3",
    });
    console.log("Tag3 の Bug:");
    console.table(bugs);

    // これでも複数の Tag を検索できるが、数が増える場合はスケールしない
    const bugs_ = await query.getBugsByMultiTags(client!, {
      tag1: "Tag1",
      tag2: "Tag2",
    });
    console.log("Tag1 と Tag2 の Bug:");
    console.table(bugs_);
  });
});
