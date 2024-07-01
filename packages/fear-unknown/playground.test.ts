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
  expect,
  test,
} from "vitest";
import * as query from "./gen/query_sql";

describe("playground", () => {
  let container: StartedTestContainer | null = null;
  let client: Client | null = null;

  beforeAll(async () => {
    container = await new GenericContainer("postgres:latest")
      .withEnvironment({
        POSTGRES_DB: "fear_unknown",
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
      database: "fear_unknown",
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
    const result1 = await client?.query(
      "SELECT * FROM bugs WHERE assigned_to <> 1"
    );
    // null は結果に表示されない
    console.log("assigned_to が 1 でないもの (null は表示されない)");
    console.table(result1?.rows);

    // null を表示するには WHERE の条件に明示する or IS DISTINCT FROM を使う
    const result2 = await client?.query(
      "SELECT * FROM bugs WHERE assigned_to IS NULL or assigned_to <> 1"
    );
    console.log("assigned_to が 1 でないもの (null は表示される)");
    console.table(result2?.rows);
    const result3 = await client?.query(
      "SELECT * FROM bugs WHERE assigned_to IS DISTINCT FROM 1"
    );
    expect(result2?.rows).toEqual(result3?.rows);

    // COALESCE 関数は可変長引数を取り、最初の非 NULL の引数を返す
    const result4 = await client?.query(
      "SELECT issue_id, status, COALESCE(assigned_to, 99) AS assigned_to FROM bugs"
    );
    console.log("assigned_to が NULL の場合は 99 に置き換える");
    console.table(result4?.rows);
  });
});
