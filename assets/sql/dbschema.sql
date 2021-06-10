CREATE DATABASE employee_tracker;

USE employee_tracker;

CREATE TABLE department (
  id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(30)
);

CREATE TABLE role (
  id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(30),
  salary DECIMAL(10,2),
  department_id int,
  FOREIGN KEY (department_id)
    REFERENCES department(id)
    ON UPDATE CASCADE
);

CREATE TABLE employee (
  id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(30),
  last_name VARCHAR(30),
  role_id int,
  manager_id int,
  FOREIGN KEY (role_id)
    REFERENCES role(id)
    ON UPDATE CASCADE,

  FOREIGN KEY (manager_id)
    REFERENCES employee(id)
    ON UPDATE CASCADE
  
);



