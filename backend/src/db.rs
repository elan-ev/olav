//! Database related things.

use anyhow::Result;
use deadpool_postgres::{Config as PoolConfig, Pool};
use log::{debug, info, trace};
use tokio_postgres::NoTls;

use crate::config;


/// Creates a new database connection pool.
pub async fn create_pool(config: &config::Db) -> Result<Pool> {
    let pool_config = PoolConfig {
        user: Some(config.user().into()),
        password: Some(config.password().into()),
        host: Some(config.host().into()),
        port: Some(config.port),
        dbname: Some(config.database.clone()),
        .. PoolConfig::default()
    };

    trace!("Database configuration: {:#?}", pool_config);

    debug!(
        "Connecting to postgresql://{}:*****@{}:{}/{}",
        config.user(),
        config.host(),
        config.port,
        config.database,
    );

    let pool = pool_config.create_pool(NoTls)?;
    info!("Created database pool");

    // Test the connection by executing a simple query.
    pool.get().await?.execute("SELECT 1", &[]).await?;
    debug!("Successfully tested database connection with test query");

    Ok(pool)
}
