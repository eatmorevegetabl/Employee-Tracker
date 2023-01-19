const db = require('./connection');
const cTable = require('console.table');
const inquirer = require('inquirer');

// inquirer prompts
const startingMenu = () => {
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'start',
        message: 'What would you like to do?',
        choices: [
          'View all departments',
          'View all roles',
          'View all employees',
          'Add a department',
          'Add a role',
          'Add an employee',
          'Update an employee role',
          'Exit',
        ],
      },
    ])
    .then((data) => {
      const nextPrompt = data.start;
      if (nextPrompt === 'View all departments') {
        viewDepartments();
      }

      if (nextPrompt === 'View all roles') {
        viewRoles();
      }

      if (nextPrompt === 'View all employees') {
        viewEmployees();
      }

      if (nextPrompt === 'Add a department') {
        addDepartment();
      }

      if (nextPrompt === 'Add a role') {
        addRole();
      }

      if (nextPrompt === 'Add an employee') {
        addEmployee();
      }

      if (nextPrompt === 'Update an employee role') {
        updateEmployeeRole();
      }

      if (nextPrompt === 'Exit') {
        process.exit();
      }
    });
};

const viewDepartments = () => {
  const sql = `SELECT * FROM company_db.departments;`;
  db.query(sql, (err, rows) => {
    if (err) {
      throw err;
    }
    console.log('\n');
    console.table(rows);
    return startingMenu();
  });
};

const viewRoles = () => {
  const sql = `SELECT roles.id, 
                            roles.title, 
                            roles.salary, 
                            departments.name AS department
                      FROM roles
                      LEFT JOIN departments ON roles.department_id = departments.id`;
  db.query(sql, (err, rows) => {
    if (err) {
      throw err;
    }
    console.log('\n');
    console.table(rows);
    return startingMenu();
  });
};

const viewEmployees = () => {
  const sql = `SELECT employees.id, 
                      employees.first_name, 
                      employees.last_name,
                      roles.title AS title,
                      roles.salary AS salary,
                      departments.name AS department 
                FROM employees
                LEFT JOIN roles ON employees.role_id = roles.id
                LEFT JOIN departments ON roles.department_id = departments.id`;
  db.query(sql, (err, rows) => {
    if (err) {
      throw err;
    }
    console.log('\n');
    console.table(rows);
    return startingMenu();
  });
};

const addDepartment = () => {
  return inquirer
    .prompt([
      {
        type: 'input',
        name: 'name',
        message: 'What is the name of this department?',
        validate: (nameInput) => {
          if (nameInput) {
            return true;
          } else {
            console.log('Please enter a department name');
            return false;
          }
        },
      },
    ])
    .then((answer) => {
      const sql = `INSERT INTO departments (name)
      VALUES (?)`;
      const params = answer.name;
      db.query(sql, params, (err) => {
        if (err) {
          throw err;
        }
        console.log('Department added!');
        return viewDepartments();
      });
    });
};

const addRole = () => {
  return inquirer
    .prompt([
      {
        type: 'input',
        name: 'title',
        message: 'What is the name of this role?',
        validate: (nameInput) => {
          if (nameInput) {
            return true;
          } else {
            console.log('Please enter a role name');
            return false;
          }
        },
      },
      {
        type: 'input',
        name: 'salary',
        message: 'What is the salary for this role?',
        validate: (salaryInput) => {
          if (isNaN(salaryInput)) {
            console.log('Please enter a salary');
            return false;
          } else {
            return true;
          }
        },
      },
    ])
    .then((answer) => {
      const params = [answer.title, answer.salary];
      const sql = `SELECT * FROM departments`;
      db.query(sql, (err, rows) => {
        if (err) {
          throw err;
        }
        const departments = rows.map(({ name, id }) => ({
          name: name,
          value: id,
        }));
        inquirer
          .prompt([
            {
              type: 'list',
              name: 'department',
              message: 'What department does this role belong to?',
              choices: departments,
            },
          ])
          .then((departmentAnswer) => {
            const department = departmentAnswer.department;
            params.push(department);
            const sql = `INSERT INTO roles (title, salary, department_id)
          VALUES (?, ?, ?)`;
            db.query(sql, params, (err) => {
              if (err) {
                throw err;
              }
              console.log('Role added!');
              return viewRoles();
            });
          });
      });
    });
};

const addEmployee = () => {
  return inquirer
    .prompt([
      {
        type: 'input',
        name: 'firstName',
        message: "What is the employee's first name?",
        validate: (nameInput) => {
          if (nameInput) {
            return true;
          } else {
            console.log('Please enter a name');
            return false;
          }
        },
      },
      {
        type: 'input',
        name: 'lastName',
        message: "What is the employee's last name?",
        validate: (nameInput) => {
          if (nameInput) {
            return true;
          } else {
            console.log('Please enter a name');
            return false;
          }
        },
      },
    ])
    .then((answer) => {
      const params = [answer.firstName, answer.lastName];
      const sql = `SELECT * FROM roles`;
      db.query(sql, (err, rows) => {
        if (err) {
          throw err;
        }
        const roles = rows.map(({ title, id }) => ({ name: title, value: id }));
        inquirer
          .prompt([
            {
              type: 'list',
              name: 'role',
              message: 'What is the role of this employee?',
              choices: roles,
            },
          ])
          .then((roleAnswer) => {
            const role = roleAnswer.role;
            params.push(role);
            const sql = `SELECT * FROM employees`;
            db.query(sql, (err, rows) => {
              if (err) {
                throw err;
              }
              const managers = rows.map(({ first_name, last_name, id }) => ({
                name: `${first_name} ${last_name}`,
                value: id,
              }));
              managers.push({ name: 'No manager', value: null });
              inquirer
                .prompt([
                  {
                    type: 'list',
                    name: 'manager',
                    message: "Who is this employee's manager?",
                    choices: managers,
                  },
                ])
                .then((managerAnswer) => {
                  const manager = managerAnswer.manager;
                  params.push(manager);
                  const sql = `INSERT INTO employees (first_name, last_name, role_id, manager_id)
              VALUES (?, ?, ?, ?)`;
                  db.query(sql, params, (err) => {
                    if (err) {
                      throw err;
                    }
                    console.log('Employee added!');
                    return viewEmployees();
                  });
                });
            });
          });
      });
    });
};

const updateEmployeeRole = () => {
  const sql = `SELECT first_name, last_name, id FROM employees`;
  db.query(sql, (err, rows) => {
    if (err) {
      throw err;
    }
    const employees = rows.map(({ first_name, last_name, id }) => ({
      name: `${first_name} ${last_name}`,
      value: id,
    }));
    inquirer
      .prompt([
        {
          type: 'list',
          name: 'employee',
          message: "Which employee's role would you like to update?",
          choices: employees,
        },
      ])
      .then((employeeAnswer) => {
        const employee = employeeAnswer.employee;
        const params = [employee];
        const sql = `SELECT title, id FROM roles`;
        db.query(sql, (err, rows) => {
          if (err) {
            throw err;
          }
          const roles = rows.map(({ title, id }) => ({
            name: title,
            value: id,
          }));
          inquirer
            .prompt([
              {
                type: 'list',
                name: 'role',
                message: 'What is the new role of this employee?',
                choices: roles,
              },
            ])
            .then((rolesAnswer) => {
              const role = rolesAnswer.role;
              params.unshift(role);
              const sql = `UPDATE employees
                        SET role_id = ?
                        WHERE id = ?`;
              db.query(sql, params, (err) => {
                if (err) {
                  throw err;
                }
                console.log('Employee updated!');
                return viewEmployees();
              });
            });
        });
      });
  });
};

module.exports = startingMenu;
