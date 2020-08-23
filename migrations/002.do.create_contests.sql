CREATE TABLE contests (
    contest_id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    date_start DATE NOT NULL,
    date_end DATE NOT NULL,
    contest_name TEXT NOT NULL,
    weighin_day TEXT NOT NULL,
    date_created TIMESTAMPTZ DEFAULT now() NOT NULL
);