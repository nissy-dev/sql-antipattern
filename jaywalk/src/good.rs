use sqlx::MySqlPool;

#[derive(Debug)]
struct Product {
    id: u64,
    name: String,
}

#[sqlx::test(fixtures("accounts", "products", "contacts"))]
async fn good_example(pool: MySqlPool) -> sqlx::Result<()> {
    // account id に紐づくデータを取得する
    let rows = sqlx::query_as!(
        Product,
        r#"
            SELECT p.* FROM products AS p
            INNER JOIN contacts AS c ON p.id = c.product_id
            WHERE c.account_id = 2
        "#,
    )
    .fetch_all(&pool)
    .await?;
    assert_eq!(rows.len(), 3);

    // product_id ごとの contacts の数を取得する
    #[derive(Debug, PartialEq)]
    struct Count {
        product_id: u64,
        accounts_per_product: i64,
    }
    let count: Vec<Count> = sqlx::query_as!(
        Count,
        "SELECT product_id, COUNT(*) as accounts_per_product FROM contacts GROUP BY product_id"
    )
    .fetch_all(&pool)
    .await?;
    assert_eq!(
        count,
        vec![
            Count {
                product_id: 1,
                accounts_per_product: 3
            },
            Count {
                product_id: 2,
                accounts_per_product: 1
            },
            Count {
                product_id: 3,
                accounts_per_product: 1
            },
            Count {
                product_id: 4,
                accounts_per_product: 2
            },
        ]
    );

    sqlx::query!("DELETE FROM contacts WHERE product_id = 2 AND account_id = 2;")
        .execute(&pool)
        .await?;
    let count: Vec<Count> = sqlx::query_as!(
        Count,
        r#"
            SELECT product_id, COUNT(*) as accounts_per_product FROM contacts
            GROUP BY product_id
        "#,
    )
    .fetch_all(&pool)
    .await?;
    assert_eq!(
        count,
        vec![
            Count {
                product_id: 1,
                accounts_per_product: 3
            },
            Count {
                product_id: 3,
                accounts_per_product: 1
            },
            Count {
                product_id: 4,
                accounts_per_product: 2
            }
        ]
    );

    Ok(())
}
