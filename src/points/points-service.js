const PointsService = {
  getAllPoints(knex) {
    return knex.select().from('points').orderBy('date_created');
  },

  insertPoints(knex, newPoints) {
    return knex
      .insert(newPoints)
      .into("points")
      .returning("*")
      .then((rows) => {
        return rows[0];
      });
  },

  getByUserId(knex, user_id) {
    return knex.from("points").select("*").where("user_id", user_id);
  },

  getByContestId(knex, contest_id) {
    return knex.from("points").select("*").where("contest_id", contest_id);
  },

  getById(knex, id) {
    return knex.from("points").select("*").where("id", id).first();
  },

  getTotalUserPoints(knex, user_id, contest_id) {
    return knex.from("points").sum("points").where({ user_id, contest_id });
  },

  getUserStomachPoints(knex, user_id, contest_id) {
    return knex
      .from("points")
      .sum("points")
      .where({ user_id: user_id, contest_id: contest_id, category: "stomach" });
  },

  getUserWeightPoints(knex, user_id, contest_id) {
    return knex
      .from("points")
      .sum("points")
      .where({ user_id: user_id, contest_id: contest_id, category: "weight" });
  },

  getUserWorkoutPoints(knex, user_id, contest_id) {
    return knex
      .from("points")
      .sum("points")
      .where({ user_id: user_id, contest_id: contest_id, category: "workout" });
  },

  deletePoints(knex, id) {
    return knex("points").where({ id }).delete();
  },

  updatePoints(knex, id, newPointsFields) {
    return knex("points").where({ id }).update(newPointsFields);
  },
};

module.exports = PointsService;
