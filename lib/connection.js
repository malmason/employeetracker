const mysql = require('mysql');
const inquirer = require('inquirer');


// Setup connection string. 
const conn = {
  host: 'localhost',
  port: 3306,
  user: 'emptracking_user',
  password: 'empuser123!',
  database: 'employee_tracker'
};

// Connect and test connection.
const connection = mysql.createConnection(conn);

connection.connect((err) => {
  if(err) throw err;
  console.log(`conneced as id ${connection.threadId}`); 
});

module.exports = {
  connection : mysql.createConnection(conn)
};