use employee_tracker;

INSERT INTO department(name) VALUES 
("Human Resources"),
("Finance"),
("Manufacturing"),
("Information Technology"),
("Shipping");

INSERT INTO role(title,salary,department_id) VALUES 
("HR Manager",185000,1),
("Finance Manager",160000,2),
("Manufacturing Manager",105000,3),
("IT Manager",120000,4),
("Shipping Manager",90000,5),
("Accountant",112000,2),
("Bookkeeper",65000,2),
("Intern",50000,2),
("Programmer",108500,4),
("Analyst",92000,4),
("Network Admin",115000,4),
("HR Assistant",78000,1),
("Supervisor",76000,3),
("Machine Operator",58000,3),
("Shipping Coordinator",82000,5);

INSERT INTO employee(first_name,last_name,role_id,manager_id)
VALUES 
("Tom","Jones",1,null),
("Sandra","Williams",12,1),
("Linda","Johnson",2,null),
("Steve","Jobs",6,3),
("Henry","Aaron",3,null),
("Jessica","Simpson",14,5),
("Nathan","Dunbar",4,null),
("Sylvia","Davis",10,7),
("William","Parks",5,null),
("Julio","Ortiz",15,9);