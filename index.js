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
    let sql = "";
    let sql2 = "";
    let roles = [];
    let mgrs = [];
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
          res.forEach(({manager})=> mgrs.push(manager));
          viewByMgr(mgrs);
        });
        break;
      case "Add Employee":
        // Get a list of the roles and the managers
        sql = `SELECT title FROM role ORDER BY title`
        sql2 = `SELECT CONCAT(first_name, " " , last_name) as manager
        FROM employee WHERE manager_id IS NULL 
        ORDER BY last_name`
        connection.query(sql, (err,res) => {
          if(err) throw err;
          res.forEach(({title})=> roles.push(title));
        });
        connection.query(sql2,async (err,res) => {
          if(err) throw err;
          res.forEach(({manager})=> mgrs.push(manager));
          addNewEmployee(roles,mgrs);
        });
        break;
      case "Remove Employee":

      case "Update Employee Role":

      case "Update Employee Manager":
     
      case "Exit Application":
        
    };
  })
};

const addNewEmployee = async (roles, managers) => {
  let mgrID = "";
  let roleID = "";
  
  let mgrQry = `SELECT id FROM employee WHERE CONCAT(first_name, " " , last_name) = ?`;

  inquirer.prompt([
    {
      name: 'fname',
      type: 'input',
      message: 'Enter the Employee\'s First Name!'
    },
    {
      name: 'lname',
      type: 'input',
      message: 'Enter the Employee\'s Last Name!'
    },
    {
      name: 'roles',
      type: 'list',
      message: 'What is the role for this employee?',
      choices: roles,
    },
    {
      name: 'manager',
      type: 'list',
      message: 'Who is this employee\'s manager?',
      choices: managers,
    },
  ]).then((empdata) => {
    let roleQry = `SELECT id FROM role WHERE title = "${empdata.roles}"`;
    connection.query(roleQry, (err,res) => {
      if(err) throw err;
      roleID = res[0].id;
      console.log(roleID);
    });
    connection.query(mgrQry,[empdata.manager], (err,res) => {
      if(err) throw err;
      mgrID = res[0].id;
      console.log(mgrID);

      let query = `INSERT INTO employee(first_name,last_name,role_id,manager_id)
        VALUES ("${empdata.fname}","${empdata.lname}",${roleID},${mgrID})`;
        console.log(query);
        connection.query(query, (err,res) => {
          if(err) throw err;
          console.log(`${res.affectedRows} employee added!\n`)
          console.log(`Added ${empdata.fname} ${empdata.lname} to the database!`);
          promptUser();
      });

    });
    
  });
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
  let mgrID = "";
  inquirer.prompt({
    type: 'list',
    name: 'mgr',
    message: 'Which managers department would you like to view?',
    choices: managers,
  }).then((answer) => {

    let query = `SELECT e.id AS manager FROM employee e WHERE CONCAT(e.first_name, " " ,e.last_name) =?`
    connection.query(query,[answer.mgr],(err,res) => {
      if(err) throw err;
      mgrID = res[0].manager;

      query = `SELECT e.id, e.first_name, e.last_name, r.title,
      d.name as department, r.salary
      FROM department d JOIN role r ON d.id = r.department_id 
      JOIN employee e ON r.id = e.role_id
      where manager_id = ${mgrID}
      ORDER BY d.name, e.last_name`;
  
      connection.query(query,(err, res) => {
        if(err) throw err;
        displayTable(table.getTable(res));
        promptUser();
      });
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

