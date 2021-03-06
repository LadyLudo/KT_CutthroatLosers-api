CREATE TABLE contest_to_user (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    user_id INTEGER NOT NULL,
    contest_id INTEGER NOT NULL,
    date_created TIMESTAMPTZ DEFAULT now() NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (contest_id) REFERENCES contests(contest_id) ON DELETE CASCADE
);