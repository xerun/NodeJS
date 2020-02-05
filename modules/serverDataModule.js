const Sequelize = require('sequelize');
var sequelize = new Sequelize('d2v1l5h9gf8pr4', 'vanjtzelbjqbuh', '5962cd798f42d265108864c463e59b9e9294e719fabd4615ead5c4054ad0f80a', {
    host: 'ec2-174-129-253-113.compute-1.amazonaws.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: true
    }
});

var Employee = sequelize.define('Employee', {
    employeeNum: {
        type: Sequelize.INTEGER,
        primaryKey: true, // use "project_id" as a primary key
        autoIncrement: true // automatically increment the value
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    SSN: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressState: Sequelize.STRING,
    addressPostal: Sequelize.STRING,
    maritalStatus: Sequelize.STRING,
    isManager: Sequelize.BOOLEAN,
    employeeManagerNum: Sequelize.INTEGER,
    status: Sequelize.STRING,
    hireDate: Sequelize.STRING
});

var Department = sequelize.define('Department', {
    departmentId: {
        type: Sequelize.INTEGER,
        primaryKey: true, // use "project_id" as a primary key
        autoIncrement: true // automatically increment the value
    },
    departmentName: Sequelize.STRING
});

Department.hasMany(Employee, {foreignKey: 'department'});

module.exports = {    
    initialize : function()
    {
        return new Promise(function(resolve, reject) {
            sequelize.sync().then(function () {
                resolve();
            }).catch(function (error) {
                reject("unable to sync the database");
            });         
        });
    },

    getAllEmployees : function()
    {
        return new Promise(function (resolve, reject) {
            Employee.findAll().then(function (data) {
                resolve(data);
            }).catch(function (error) {
                reject("no results returned");
            }); 
        });
    },

    getEmployeesByDepartment : function(dpt)
    {
        return new Promise(function (resolve, reject) {
            Employee.findAll({
                where: {
                    department : dpt
                }
            }).then(function (data) {
                resolve(data);
            }).catch(function (error) {
                reject("no results returned");
            }); 
        });
    },

    getEmployeeByNum : function(num)
    {
        return new Promise(function (resolve, reject) {
            Employee.findAll({
                where: {
                    employeeNum : num
                }
            }).then(function (data) {              
                resolve(data[0]);
            }).catch(function (error) {
                reject("no results returned");
            }); 
        });
    },    

    addEmployee : function(employeeData)
    {
        return new Promise(function (resolve, reject) {
            employeeData.isManager = (employeeData.isManager) ? true : false;

            for(let prop in employeeData){
                if(employeeData[prop] == ""){
                    employeeData[prop] = null;
                }
            }

            Employee.create(employeeData).then(function () {
                resolve();
            }).catch(function (error) {
                reject("no results returned");
            });            
        });
    },

    updateEmployee : function(employeeData)
    {
        return new Promise(function (resolve, reject) {
            for(let prop in employeeData){
                if(employeeData[prop] == ""){
                    employeeData[prop] = null;
                }
            }

            Employee.update(employeeData,{
                where: {
                    employeeNum : employeeData.employeeNum
                }}).then(function () {
                resolve();
            }).catch(function (error) {
                reject("no results returned");
            }); 
        });
    },

    deleteEmployeeByNum : function(empNum)
    {
        return new Promise(function (resolve, reject) {
            Employee.destroy({
                where: {
                    employeeNum : empNum
                }
            }).then(function (data) {
                resolve();
            }).catch(function (error) {
                reject("delete failed");
            }); 
        });
    },

    getDepartments : function()
    {
        return new Promise(function (resolve, reject) {
            Department.findAll().then(function (data) {
                resolve(data);
            }).catch(function (error) {
                reject("no results returned");
            }); 
        });
    },

    getDepartmentById : function(num)
    {
        return new Promise(function (resolve, reject) {
            Department.findAll({
                where: {
                    departmentId : num
                }
            }).then(function (data) {
                resolve(data[0]);
            }).catch(function (error) {
                reject("no results returned");
            }); 
        });
    },

    addDepartment : function(departmentData)
    {
        return new Promise(function (resolve, reject) {
            for(let prop in departmentData){
                if(departmentData[prop] == ""){
                    departmentData[prop] = null;
                }
            }
            Department.create(departmentData).then(function () {
                resolve();
            }).catch(function (error) {
                reject("no results returned");
            }); 
        });
    },

    updateDepartment : function(departmentData)
    {
        return new Promise(function (resolve, reject) {
            for(let prop in departmentData){
                if(departmentData[prop] == ""){
                    departmentData[prop] = null;
                }
            }
            Department.update(departmentData,{
                where: {
                    departmentId : departmentData.departmentId
                }
            }).then(function () {
                resolve();
            }).catch(function (error) {
                reject("no results returned");
            }); 
        });
    },

    deleteDepartmentById : function(id)
    {
        return new Promise(function (resolve, reject) {
            Department.destroy({
                where: {
                    departmentId : id
                }
            }).then(function (data) {
                resolve();
            }).catch(function (error) {
                reject("delete failed");
            }); 
        });
    }
};