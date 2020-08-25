CREATE TABLE workout_tracking (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    contest_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    category TEXT NOT NULL,
    date_created TIMESTAMPTZ DEFAULT now() NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (contest_id) REFERENCES contests(contest_id)
);