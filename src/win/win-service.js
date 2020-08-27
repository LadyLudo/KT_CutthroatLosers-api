const WinService = {
    getAllWins(knex) {
      return knex
        .select('*')
        .from('win')
    },
  
    insertWin(knex, newWin) {
      return knex
        .insert(newWin)
        .into('win')
        .returning('*')
        .then(rows => {
          return rows[0]
        })
    },
  
    getByWinId(knex, win_id) {
      return knex
        .from('win')
        .select('*')
        .where('win_id', win_id)   
    },
  
    deleteWin(knex, win_id) {
      return knex('win')
        .where({ win_id })
        .delete()
    },
  
    updateWin(knex, win_id, newWinFields) {
      return knex('win')
        .where({ win_id })
        .update(newWinFields)
    },
  }
  
  module.exports = WinService