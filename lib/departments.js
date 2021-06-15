const dbconnection = require('./connection');
const table = require('console.table');
// TODO: Refactor department queries to use this class.
class Department {

  async viewAllDepartments() {  
    let sql = `SELECT * FROM department`
    dbconnection.connection.query(sql, async (err, res)  => {
      if(err) throw err;
      console.log(table.getTable(res)); 
      return await res;
    });
  };

  addDept() {

  };
  updateDept() {

  };
  deleteDept() {

  };

};

module.exports = Department;