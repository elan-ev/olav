//! This tiny binary just export the GraphQL API Schema from the backend `api`
//! code. The schema is required for the frontend to compile.

use anyhow::Result;
use std::path::Path;

use tobira_api as api;

const PRELUDE: &str = "\
    # Auto-generated file: DO NOT EDIT DIRECTLY!\n\
    #\n\
    # This file is generated by `backend/api/src/bin/export-schema.rs`. The\n\
    # API itself is defined in `backend/api`.\n\
";

fn main() -> Result<()> {
    let schema = format!("{}\n{}", PRELUDE, api::root_node().as_schema_language());

    if let Some(target) = std::env::args().nth(1) {
        if let Some(parent) = Path::new(&target).parent() {
            std::fs::create_dir_all(parent)?;
        }
        std::fs::write(target, schema)?;
    } else {
        print!("{}", schema);
    }

    Ok(())
}
