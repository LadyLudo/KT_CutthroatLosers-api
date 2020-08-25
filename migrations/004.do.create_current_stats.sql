CREATE TABLE current_stats (
    user_id INTEGER NOT NULL,
    current_weight NUMERIC NOT NULL,
    goal_weight NUMERIC NOT NULL,
    display_name TEXT NOT NULL,
    contest_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (contest_id) REFERENCES contests(contest_id)
    );