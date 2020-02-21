use diesel::*;

table! {
    posts (id) {
        id -> Int4,
        author -> Varchar,
        body -> Text,
        published_at -> Timestamp,
    }
}
