const mysql = require('mysql');
const inquirer = require('inquirer');
const chalk = require('chalk'); // Used to color the text in the terminal
const figlet = require('figlet'); // for creating a command-line banner
const table = require('console.table');
// const department = require('./lib/departments');

let sql = "";
let sql2 = "";

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
  console.log(`connected as id ${connection.threadId}\n`); 
});

const promptUser = async () => {
  inquirer.prompt([
    {
      type: 'list',
      name: 'dowhat',
      message: 'What would you like to do?',
      choices: ['View All Employees', 'View All Employees By Department', 'View All Employees By Manager','View Departments','View Roles','Add Department','Add Role','Add Employee', 'Remove Employee','Update Employee Role','Update Employee Manager','View Total Utilized Budget by Department','Exit Application'],
    }
  ])
  .then((answer) => {
    let roles = [];
    let mgrs = [];
    let depts = [];
    let emps = [];
    switch(answer.dowhat) {
      case "View All Employees":
        sql = `SELECT * FROM employee`
        connection.query(sql,(err, res) => {
          if(err) throw err;
          displayTable(res);
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
      case "View Departments":
        sql = `SELECT * FROM department`;
        connection.query(sql, async (err, res)  => {
          if(err) throw err;
          displayTable(res);
        });
        break;
      case "View Roles":
        sql = `SELECT id,title,CONCAT("$",FORMAT(salary,2)) AS Salary,department_id FROM role`
        connection.query(sql,(err, res) => {
          if(err) throw err;
          displayTable(res);
        });
        break;
      case "Add Department":
        addNewDept();
        break;
      case "Add Role":
        sql = `SELECT name FROM department`;
        connection.query(sql, async (err, res)  => {
          if(err) throw err;
          res.forEach(({name})=> depts.push(name));
          addNewRole(depts);
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
        sql = `SELECT CONCAT(first_name, " " , last_name) as employee
        FROM employee ORDER BY last_name`;
        connection.query(sql, async (err, res)  => {
          if(err) throw err;
          res.forEach(({employee})=> emps.push(employee));
          removeEmployee(emps);
        });
        break;
      case "Update Employee Role":
        sql = `SELECT CONCAT(first_name, " " , last_name) as employee
        FROM employee ORDER BY last_name`;
        sql2 = `SELECT title FROM role ORDER BY title`
        connection.query(sql, async (err, res)  => {
          if(err) throw err;
          res.forEach(({employee})=> emps.push(employee));
        });
        connection.query(sql2,async (err,res) => {
          if(err) throw err;
          res.forEach(({title})=> roles.push(title));
          updateEmployeeRole(emps,roles);
        });
        break;
      case "Update Employee Manager":
        sql = `SELECT CONCAT(first_name, " " , last_name) as employee
        FROM employee WHERE manager_id IS NOT NULL ORDER BY last_name`;
        sql2 = `SELECT CONCAT(first_name, " " , last_name) as manager
        FROM employee WHERE manager_id IS NULL 
        ORDER BY last_name`
        connection.query(sql, async (err, res)  => {
          if(err) throw err;
          res.forEach(({employee})=> emps.push(employee));
        });
        connection.query(sql2,async (err,res) => {
          if(err) throw err;
          res.forEach(({manager})=> mgrs.push(manager));
          updateEmployeeMgr(emps,mgrs);
        });
        break;

      case "View Total Utilized Budget by Department":
        sql = `SELECT d.name,CONCAT("$",FORMAT(SUM(r.salary),2)) AS TotalBudget
        FROM department d JOIN role r
        ON d.id = r.department_id
        JOIN employee e ON r.id = e.role_id
        GROUP BY d.name
        ORDER BY d.name`;
        connection.query(sql,(err, res) => {
          if(err) throw err;
          displayTable(res);
        });
        break;
      case "Exit Application":
        connection.end();
    };
  })
};
const updateEmployeeMgr = async (employees, managers) => {
  let mgrID = "";
  inquirer.prompt([
    {
      name: 'employee',
      type: 'list',
      message: 'Select the employee whose manager you would like to change!',
      choices: employees
    },
    {
      name: 'mgr',
      type: 'list',
      message: 'Select the manager you would like to assign to this employee!',
      choices: managers
    }
  ]).then((data)=> {
    
    sql2 =`SELECT id from employee WHERE CONCAT(first_name, " " , last_name) = "${data.mgr}"`
  
    connection.query(sql2, async (err, res)  => {
      if(err) throw err;
      mgrID = res[0].id;
       sql = `UPDATE employee SET manager_id = ${mgrID} WHERE CONCAT(first_name, " " , last_name) = "${data.employee}"`
  
      connection.query(sql, async (err,res)=> {
        if(err) throw err;
        console.log(`${res.affectedRows} row updated!`);
        console.log(`Updated "${data.employee}", changed their manager to "${data.mgr}"!`);
        promptUser();
      });
    });
  });
};
const updateEmployeeRole = async(employees,roles) => {
  inquirer.prompt([
    {
      name: 'employee',
      type: 'list',
      message: 'Select the employee whose role you would like to change!',
      choices: employees
    },
    {
      name: 'role',
      type: 'list',
      message: 'Select the role you would like to assign to this employee!',
      choices: roles
    }
  ]).then((data)=> {
    sql = `UPDATE employee SET role_id = (SELECT id FROM role WHERE title = "${data.role}") WHERE CONCAT(first_name, " " , last_name) = "${data.employee}"`
      connection.query(sql, (err,res)=> {
        if(err) throw err;
        console.log(`${res.affectedRows} row updated!`);
        console.log(`Updated "${data.employee}", changed their role to "${data.role}"!`);
        promptUser();
      });
  });
};
const removeEmployee = async (employees) => {
  inquirer.prompt([
    {
      name: 'employee',
      type: 'list',
      message: 'Select the employee you would like to remove!',
      choices: employees
    }
  ]).then((data)=> {
    sql = `DELETE FROM employee WHERE CONCAT(first_name, " " , last_name) = "${data.employee}"`
      connection.query(sql, (err,res)=> {
        if(err) throw err;
        console.log(`${res.affectedRows} employee deleted from the database!`);
        console.log(`Deleted "${data.employee}"!`);
        promptUser();
      });
  });
};
const addNewDept = async () => {
  inquirer.prompt([
   {
      name: 'dept',
      type: 'input',
      message: 'What is the name of the new depatment?'
    }
  ]).then((data) =>{
    sql = `INSERT INTO department(name) VALUES ("${data.dept}")`
    connection.query(sql, (err,res) => {
      if(err) throw err;
      console.log(`${res.affectedRows} department added!\n`)
      console.log(`Added ${data.dept} to the database!`);
      promptUser();
    });
  });
};


const addNewRole = async (departments) => {
  inquirer.prompt([
    {
      name: 'role',
      type: 'input',
      message: 'What is the title of the new Role you want to create?'
    },
    {
      name: 'salary',
      type: 'input',
      message: 'What is the salary for this position?'
    },
    {
      name: 'dept',
      type: 'list',
      message: 'Which department does this role belong to?',
      choices: departments
    }
  ]).then((data) =>{
    sql = `INSERT INTO role(title,salary,department_id) VALUES ("${data.role}",${data.salary},
    (SELECT id FROM department WHERE name = "${data.dept}"))`
    connection.query(sql, (err,res) => {
      if(err) throw err;
      console.log(`${res.affectedRows} role added!\n`)
      console.log(`Added ${data.role} for the ${data.dept} department to the database!`);
      promptUser();
    });
  });
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
    });
    connection.query(mgrQry,[empdata.manager], (err,res) => {
      if(err) throw err;
      mgrID = res[0].id;

      let query = `INSERT INTO employee(first_name,last_name,role_id,manager_id)
        VALUES ("${empdata.fname}","${empdata.lname}",${roleID},${mgrID})`;
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
      displayTable(res);
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
    // Get all of the employee information by manager, capture manager id from the sub-query in the Where clause.
    let query = `SELECT * FROM employee WHERE manager_id = 
    (SELECT id FROM employee WHERE CONCAT(first_name, " " ,last_name) ="${answer.mgr}")`
      connection.query(query,(err, res) => {
        if(err) throw err;
        displayTable(res);
      });
    });
};

const displayTable = (data) => {
  console.log(table.getTable(data));
  promptUser();
};

const init = async () => {
  console.log(chalk.redBright(
    figlet.textSync('EMPLOYEE MANAGER', {horizontalLayout: "fitted"})
  ));
  promptUser();
};

init();

