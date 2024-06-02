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

describe("bad case", () => {
  let container: StartedTestContainer | null = null;
  let client: Client | null = null;

  beforeAll(async () => {
    container = await new GenericContainer("postgres:latest")
      .withEnvironment({
        POSTGRES_DB: "keyless_entry",
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
      database: "keyless_entry",
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

    const bugs = await query.getAllBugs(client!);
    console.log("元の Bugs テーブル:");
    console.table(bugs);
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

  test("外部キー制約", async () => {
    // account_id = 1 を 3 へ更新する
    await query.updateAccountId(client!, { accountId: 1, newId: 3 });

    // 外部キー制約により、account_id = 1 の行は更新される
    const bugs2 = await query.getAllBugs(client!);
    console.log("Accounts の更新により reported_by が更新される:");
    console.table(bugs2);

    // account_id = 3 を削除する
    await query.deleteAccounts(client!, { accountId: 3 });

    // 外部キー制約により、account_id = 1 の行は削除される
    const bugs3 = await query.getAllBugs(client!);
    console.log("Accounts のデータ削除により Bugs のデータも削除される:");
    console.table(bugs3);
  });

  test("外部キー制約 (削除ではなく null で埋めるようにする", async () => {
    // alter table で外部キー制約を変更
    await client?.query(
      "ALTER TABLE Bugs DROP CONSTRAINT bugs_reported_by_fkey"
    );
    await client?.query(
      "ALTER TABLE Bugs ADD FOREIGN KEY (reported_by) REFERENCES Accounts(account_id) ON UPDATE CASCADE ON DELETE SET NULL"
    );
    // account_id = 1 を削除する
    await query.deleteAccounts(client!, { accountId: 1 });

    // 外部キー制約により account_id = 1 の値は null になる
    const newBugs = await query.getAllBugs(client!);
    console.log("Accounts の削除により reported_by が null になる:");
    console.table(newBugs);
  });
});
