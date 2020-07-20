Tobira Backend
==============


Building the Tobira Backend
---------------------------

Use [Cargo](https://doc.rust-lang.org/cargo/getting-started/first-steps.html) to download all necessary dependencies and to build the backend.

Build and run the backend:

```sh
cargo run
```


Configuration
-------------

Create `config.toml` in the directory you are running the backend from.
The file should look like this:


```toml
[db]
user = "tobira"
password = "tobira-dev-db-pw"
host = "127.0.0.1"
port = 5432
database = "tobira"
```