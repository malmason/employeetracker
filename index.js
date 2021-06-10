const mysql = require('mysql');
const inquirer = require('inquirer');
const chalk = require('chalk'); // Used to color the text in the terminal
const figlet = require('figlet'); // for creating a command-line banner
const table = require('console.table');

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

const promptUser = async () => {
  inquirer.prompt([
    {
      type: 'list',
      name: 'dowhat',
      message: 'What would you like to do?',
      choices: ['View All Employees', 'View All Employees By Department', 'View All Employees By Manager','Add Employee', 'Remove Employee','Update Employee Role','Update Employee Manager','Exit Application'],
    }
  ])
  .then((answer) => {
    let sql = ""
    switch(answer.dowhat) {
      case "View All Employees":
        sql = `SELECT * FROM employee`
        connection.query(sql,(err, res) => {
          if(err) throw err;
          displayTable(table.getTable(res));
          promptUser();
        });
        break;
      case "View All Employees By Department":
        // Query the departments and pass it to the viewByDept function.
        sql = `SELECT name FROM department ORDER BY name`
        connection.query(sql,(err,res) => {
          if(err) throw err;
          viewByDept(res);
        });
        break;
      case "View All Employees By Manager":
        sql = `SELECT CONCAT(first_name, " ", last_name) AS manager FROM employee 
        WHERE manager_id IS NULL ORDER BY last_name`
        connection.query(sql,(err,res) => {
          if(err) throw err;
          viewByMgr(res);
        });
        break;
      case "Add Employee":

      case "Remove Employee":

      case "Update Employee Role":

      case "Update Employee Manager":

      case "Exit Application":

    };
  })
};

const viewByDept = async (departments) => {
  inquirer.prompt({
    type: 'list',
    name: 'dept',
    message: 'What department do you want to view?',
    choices: departments,
  }).then((answer) => {
    let query = `SELECT e.id, e.first_name, e.last_name, r.title,
    d.name as department, r.salary, CONCAT(e2.first_name, " " ,e2.last_name) as manager
    FROM department d JOIN role r ON d.id = r.department_id 
    JOIN employee e ON r.id = e.role_id
    LEFT JOIN employee e2 ON e.manager_id = e2.id
    where d.name = ?
    ORDER BY d.name, e.last_name`;
    connection.query(query,[answer.dept],(err, res) => {
      if(err) throw err;
      displayTable(table.getTable(res));
      promptUser();
    });
  });
};

const viewByMgr = async (managers) => {
  inquirer.prompt({
    type: 'list',
    name: 'mgr',
    message: 'Which managers department would you like to view?',
    choices: managers,
  }).then((answer) => {
    let query = `SELECT e.id, e.first_name, e.last_name, r.title,
    d.name as department, r.salary, CONCAT(e2.first_name, " " ,e2.last_name) as manager
    FROM department d JOIN role r ON d.id = r.department_id 
    JOIN employee e ON r.id = e.role_id
    LEFT JOIN employee e2 ON e.manager_id = e2.id
    where d.name = ?
    ORDER BY d.name, e.last_name`;
    connection.query(query,[answer.mgr],(err, res) => {
      if(err) throw err;
      displayTable(table.getTable(res));
      promptUser();
    });
  });
};

const displayTable = (data) => {
  console.log(data);
};

const init = async () => {
  console.log(chalk.redBright(
    figlet.textSync('EMPLOYEE MANAGER', {horizontalLayout: "fitted"})
  ));
  promptUser();
};

init();

