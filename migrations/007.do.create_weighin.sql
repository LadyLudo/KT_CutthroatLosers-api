CREATE TABLE weighin (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    user_id INTEGER NOT NULL,
    contest_id INTEGER NOT NULL,
    weight TEXT NOT NULL,
    date_created TIMESTAMPTZ DEFAULT now() NOT NULL
);