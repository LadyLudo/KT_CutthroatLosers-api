CUTTHROAT LOSERS

Live App: https://cutthroat-losers-app.herokuapp.com/

APP Repo: https://github.com/Kevindavis5454/cutthroat-losers.git

![Alt text](/src/Images/CLosers1.png?raw=true "Optional Title")
![Alt text](/src/Images/CLosers2.png?raw=true "Optional Title")
![Alt text](/src/Images/CLosers3.png?raw=true "Optional Title")

Summary:
This API allows for the creation, reading, updating and deletion of weight loss contest data. You can store users, weights, measurements, points, contests, and workouts.

Endpoints:
/contest_to_user : Allows the association of a particular contest to a user. 
    Accepts for Input: user_id , contest_id
    Outputs: json

/contests : Allows the storage of high level contest data 
    Accepts for Input: date_start , date_end , contest_name , weighin_day
    Outputs: json

/current_stats : Allows for easy retrieval of a users current and most useful information
    Accepts For Input: user_id , current_weight , goal_weight , display_name
    Outputs: json

/measurements : Allows the storage of measurement data related to weight loss
    Accepts For Input: user_id , contest_id , measurement
    Outputs: json

/points : Allows the storage of points data
    Accepts for Input: user_id , contest_id , points , category , description , win_id
    Outputs: json

/users : Allows the storage of user data
    Accepts for Input: password , display_name , username
    Outputs: json

/weighin : Allows for the storage of weights
    Accepts for Input: user_id , contest_id , weight
    Outputs: json

/win : Allows for the categoization of win points
    Accepts for Input: win , contest_id

/workout_tracking : Allows for the storage of strength or cardio workouts
    Accepts for Input: user_id , contest_id , category



This app is built with the following languages, frameworks, and libraries:

Front end: React, JSX, CSS, VictoryChart, DatePicker, Moment

Back end: Node.js, Express, Knex, Mocha, Chai

Database: PostgresSQL