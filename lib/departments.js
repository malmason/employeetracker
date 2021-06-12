const dbconnection = require('./connection');
const table = require('console.table');
class Department {

  async viewAllDepartments() {  
    let sql = `SELECT * FROM department`
    dbconnection.connection.query(sql, async (err, res)  => {
      if(err) throw err;
      console.log(table.getTable(res)); 
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