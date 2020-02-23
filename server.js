var HTTP_PORT = process.env.PORT || 8080;
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const exphbs = require('express-handlebars');
var app = express();
const srvData = require("./modules/serverDataModule");

app.engine('.hbs', exphbs({ 
    extname: '.hbs', 
    defaultLayout: 'main',
    helpers: {
        navLink: function(url, options){
            return '<li' +
            ((url == app.locals.activeRoute) ? ' class="nav-item active" ' : ' class="nav-item" ') +
            '><a class="nav-link hvr-shutter-out-vertical" href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }
    }
}));
app.set('view engine', '.hbs');
app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(function(req,res,next){
    let route = req.baseUrl + req.path;
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
    next();
});

app.get("/",function(req, res){
    res.render('home');
});

app.get("/about",function(req, res){
    res.render('about');
});

app.get("/htmlDemo",function(req, res){
    res.render('htmlDemo');
});

app.get("/employees/add",function(req, res){
    srvData.getDepartments()
    .then(function(data){
        res.render("addEmployee", {departments: data})
    })
    .catch(function(error){
        res.render('addEmployee');
    });     
});

app.get("/employees",function(req, res){
    let dpt = req.query.department;
    if(isNaN(dpt))
    {
        srvData.getAllEmployees()
        .then(function(data){
            res.render("employees", {employees: data})
        })
        .catch(function(error){
            res.render("employees", {message: "no results"});
        });  
    }else{
        srvData.getEmployeesByDepartment(dpt)
        .then(function(data){
            res.render("employees", {employees: data})
        })
        .catch(function(error){
            res.render("employees", {message: "no results"});
        });  
    }
});  

app.get("/employee/:empNum",function(req, res){
    // initialize an empty object to store the values
    let viewData = {};
    srvData.getEmployeeByNum(req.params.empNum).then((data) => {
        if (data) {
            viewData.employee = data; //store employee data in the "viewData" object as "employee"
        } else {
            viewData.employee = null; // set employee to null if none were returned
        }
    }).catch(() => {
        viewData.employee = null; // set employee to null if there was an error
    }).then(srvData.getDepartments)
    .then((data) => {
        viewData.departments = data; // store department data in the "viewData" object as "departments"
        // loop through viewData.departments and once we have found the departmentId that matches
        // the employee's "department" value, add a "selected" property to the matching
        // viewData.departments object
        for (let i = 0; i < viewData.departments.length; i++) {
            if (viewData.departments[i].departmentId == viewData.employee.department) {
                viewData.departments[i].selected = true;
            }
        }
    }).catch(() => {
        viewData.departments = []; // set departments to empty if there was an error
    }).then(() => {
        if (viewData.employee == null) { // if no employee - return an error
            res.status(404).send("Employee Not Found");
        } else {
            //console.log(viewData.employee);
            res.render("employee", { viewData: viewData }); // render the "employee" view
        }
    });   
});

app.post("/employees/add",function(req, res){
    srvData.addEmployee(req.body)
    .then(function(msg){
        res.redirect("/employees");
    })
    .catch(function(error){
        res.render("employee", {message: "no results"});
    });
});

app.post("/employee/update",function(req, res){
    srvData.updateEmployee(req.body)
    .then(function(msg){
        res.redirect("/employees");
    })
    .catch(function(error){
        res.render("employee", {message: "no results"});
    });
});

app.get("/employees/delete/:empNum",function(req, res){    
    let id = req.params.empNum;
    srvData.deleteEmployeeByNum(id)
    .then(function(data){
        res.redirect("/employees");
    })
    .catch(function(error){
        res.status(500).send("Unable to Remove Employee / Employee not found)");
    });    
});

app.get("/departments/add",function(req, res){
    res.render('addDepartment');
});

app.get("/departments",function(req, res){
    srvData.getDepartments()
    .then(function(data){
        res.render("departments", {departments: data})
    })
    .catch(function(error){
        res.render("departments", {message: "no results"});
    }); 
});

app.get("/department/:dptId",function(req, res){
    let id = req.params.dptId;
    srvData.getDepartmentById(id)
    .then(function(data){
        res.render("department", {department: data})
    })
    .catch(function(error){
        res.render("department", {message: "query returned 0 results"});
    });    
});

app.post("/departments/add",function(req, res){
    srvData.addDepartment(req.body)
    .then(function(msg){
        res.redirect("/departments");
    })
    .catch(function(error){
        res.render("department", {message: "no results"});
    });
});

app.post("/department/update",function(req, res){
    srvData.updateDepartment(req.body)
    .then(function(msg){
        res.redirect("/departments");
    })
    .catch(function(error){
        res.render("department", {message: "no results"});
    });
});

app.get("/departments/delete/:dptId",function(req, res){
    let id = req.params.dptId;
    srvData.deleteDepartmentById(id)
    .then(function(data){
        res.redirect("/departments");
    })
    .catch(function(error){
        res.status(500).send("Unable to Remove Department / Department not found)");
    });    
});

app.use((req, res, next) =>{
    res.status(404).sendFile(path.join(__dirname,"/views/404.html"));
});

srvData.initialize() // call the initialize from ServerDataModule.js
.then(()=>{
    app.listen(HTTP_PORT, ()=>{console.log("server listening on port: " + HTTP_PORT)});
}) 
.catch((err)=>{
    console.log(err);
});
