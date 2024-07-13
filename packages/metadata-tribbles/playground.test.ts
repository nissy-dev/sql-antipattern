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

describe("playground", () => {
  let container: StartedTestContainer | null = null;
  let client: Client | null = null;

  beforeAll(async () => {
    container = await new GenericContainer("postgres:latest")
      .withEnvironment({
        POSTGRES_DB: "metadata_tribbles",
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
      database: "metadata_tribbles",
      user: "postgres",
      password: "password",
    });
    await client.connect();
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

  // https://qiita.com/daichi_yamazaki/items/fdb680c8885263a442f7
  test("クエリの確認", async () => {
    // テーブルの作成
    // PARTITION BY LIST で値を列挙、PARTITION BY RANGE で範囲を指定してパーティションを作成
    await client?.query(
      "CREATE TABLE users (id INTEGER, name TEXT, age INTEGER) PARTITION BY LIST (age);"
    );
    // パーティションの作成
    await client?.query(
      "CREATE TABLE users_20 PARTITION OF users FOR VALUES IN(20);"
    );
    await client?.query(
      "CREATE TABLE users_21 PARTITION OF users FOR VALUES IN(21);"
    );
    // データの挿入
    await client?.query("INSERT INTO users VALUES (1, 'User1', 20);");
    await client?.query("INSERT INTO users VALUES (2, 'User2', 21);");
    const res = await client?.query("SELECT * FROM users;");
    console.table(res?.rows);

    // このままだと、age が 20, 21 の場合にエラーが発生する
    const insert = client?.query("INSERT INTO users VALUES (3, 'User3', 30);");
    await expect(insert).rejects.toThrowError();
  });

  test("クエリの確認 (デフォルトパーティションあり)", async () => {
    // テーブルの作成
    // PARTITION BY LIST で値を列挙、PARTITION BY RANGE で範囲を指定してパーティションを作成
    await client?.query(
      "CREATE TABLE users (id INTEGER, name TEXT, age INTEGER) PARTITION BY LIST (age);"
    );
    // パーティションの作成
    // デフォルトパーティションを作成
    await client?.query(
      "CREATE TABLE users_default PARTITION OF users DEFAULT;"
    );
    await client?.query(
      "CREATE TABLE users_20 PARTITION OF users FOR VALUES IN(20);"
    );
    await client?.query(
      "CREATE TABLE users_21 PARTITION OF users FOR VALUES IN(21);"
    );
    // データの挿入
    await client?.query("INSERT INTO users VALUES (1, 'User1', 20);");
    await client?.query("INSERT INTO users VALUES (2, 'User2', 21);");
    await client?.query("INSERT INTO users VALUES (3, 'User3', 30);");
    const res = await client?.query("SELECT * FROM users;");
    console.table(res?.rows);
  });
});
