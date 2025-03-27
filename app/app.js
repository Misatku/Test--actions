// Import express.js
const express = require("express");

// Create express app
var app = express();

// Add static files location
app.use(express.static("static"));

// Use the Pug templating engine
app.set('view engine', 'pug');
app.set('views', './app/views');

// Get the functions in the db.js file to use
const db = require('./services/db');
app.use(express.urlencoded({ extended: true}))

//Get the student model
const { Student } = require("./models/student");

// Create a route for root - /
app.get("/", function(req, res) {
    res.render("index");
});


// Task 1 JSON formatted listing of students
app.get("/all-students", function(req, res) {
    var sql = 'select * from Students';
    // As we are not inside an async function we cannot use await
    // So we use .then syntax to ensure that we wait until the 
    // promise returned by the async function is resolved before we proceed
    db.query(sql).then(results => {
        console.log(results);
        res.json(results);
    });

});

// Task 2 display a formatted list of students
app.get("/all-students-formatted", function(req, res) {
    var sql = 'select * from Students';
    db.query(sql).then(results => {
    	    // Send the results rows to the all-students template
    	    // The rows will be in a variable called data
        res.render('all-students', {data: results});
    });
});

// Task 3 - Single student page.  Show the students name, course and modules
app.get("/student-single/:id", async function (req, res) {
    var stId = req.params.id;
    //Create a student class with the ID passed
    var student = new Student(stId);
    await student.getStudentDetails();
    await student.getStudentProgramme();
    await student.getStudentModules();
    console.log(student);
    res.render('student', {student:student}); 
    });

app.post('/add-note', function (req, res){
    params = req.body;
    var student = new Student(params.id)
    try{
        student.addStudentNote(params.note).then(result =>{
            res.redirect('/student-single/' + params.id);
        })
    } catch (err){
        console.error('Error while adding note', err.message);
    }
});

// JSON output of all programmes
app.get("/all-programmes", function(req, res) {
    var sql = 'select * from Programmes';
    // As we are not inside an async function we cannot use await
    // So we use .then syntax to ensure that we wait until the 
    // promise returned by the async function is resolved before we proceed
    db.query(sql).then(results => {
        console.log(results);
        res.json(results);
    });

});

// Single programme page (no formatting or template)
app.get("/programme-single/:id", async function (req, res) {
    var pCode = req.params.id;
    var pSql = "SELECT * FROM Programmes WHERE id = ?";
    var results = await db.query(pSql, [pCode]);
    //Now call the database for the modules
    //Why do you think that the word modules is coming in before the name of the programme??
    var modSql = "SELECT * FROM Programme_Modules pm \
    JOIN Modules m on m.code = pm.module \
    WHERE programme = ?";
    var modResults = await db.query(modSql, [pCode]);
    // String the results together, just for now.  Later we will push this
    // through the template
    res.send(JSON.stringify(results) + JSON.stringify(modResults));  
});


// Create a route for testing the db
app.get("/db_test", function(req, res) {
    // Assumes a table called test_table exists in your database
    var sql = 'select * from test_table';
    // As we are not inside an async function we cannot use await
    // So we use .then syntax to ensure that we wait until the 
    // promise returned by the async function is resolved before we proceed
    db.query(sql).then(results => {
        console.log(results);
        res.json(results)
    });
});

// Create a route for /goodbye
// Responds to a 'GET' request
app.get("/goodbye", function(req, res) {
    res.send("Goodbye world!");
});

// Create a dynamic route for /hello/<name>, where name is any value provided by user
// At the end of the URL
// Responds to a 'GET' request
app.get("/hello/:name", function(req, res) {
    // req.params contains any parameters in the request
    // We can examine it in the console for debugging purposes
    console.log(req.params);
    //  Retrieve the 'name' parameter and use it in a dynamically generated page
    res.send("Hello " + req.params.name);
});

// Start server on port 3000
app.listen(3000,function(){
    console.log(`Server running at http://127.0.0.1:3000/`);
});


/*//Exercise 2 - Create route path /roehampton
app.get("/roehampton", function(req, res) {
    res.send("Hello Roehampton!");
});

//Exercise 4 - programming logic
app.get("/roehampton", function(req, res) {
    console.log(req.url)
    let path = req.url;
    res.send(path.substring(0,3));
    });

//Exercise 1 - Dynamic routes
app.get("/hello/:name", function(req, res) {
    console.log(req.params);
    res.send("Hello " + req.params.name);
    }); 

//Exercise 2 - dynamic route which where a user may request /user/:id where the ID can be any ID number
app.get('/user/:id', (req,res) =>{
    const userId = req.params.id;
    res.send("The user Id is: " + req.params.id);
    });    

//Exercise 3 - dynamic route which where a user may request /student/:name/:id where the ID can be any ID number, and the name can be any name. 
app.get('/student/:name/:id', (req, res) => {
    const userId = req.params.id;
    const userName = req.params.name;
    res.send("The user Id is: " + userId + " and their name is " + userName);
    });

//Exrecise 4 - output the name and ID in an HTML table
app.get('/student/:name/:id', (req, res) => {
    const userId = req.params.id;
    const userName = req.params.name;
    const htmlResponse = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Student Info</title>
    <style>
    table {
    width: 50%;
    margin: 20px auto;
    border-collapse: collapse;
    }
    th, td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
    }
    th {
    background-color: #f2f2f2;
    }
    </style>
    </head>
    <body>
    <table>
    <tr>
    <th>Name</th>
    <th>ID</th>
    </tr>
    <tr>
    <td>${userName}</td>
    <td>${userId}</td>
    </tr>
    </table>
    </body>
    </html>
    `;
    res.send(htmlResponse);
    });

app.get("/roehampton", function(req, res) {
    let path = req.url.substring(1);  // Remove the leading '/'
    let reversedPath = path.split('').reverse().join('');  // Reverse the string
    res.send(reversedPath);  // Send the reversed string
});

//Aditional exercise to display numbers from 0 to the number entered formatted in HTML table.
app.get('/number/:n', (req, res) => {
    const number = parseInt(req.params.n); // Capture the number from the URL and convert it to an integer
    let html = '<table border="1">'; // Start the HTML table

    // Loop from 0 to the number specified in the route
    for (let i = 0; i <= number; i++) {
        html += `<tr><td>${i}</td></tr>`; // Each iteration adds a new row to the table with the current number
    }

    html += '</table>'; // Close the HTML table
    res.send(html); // Send the generated HTML table back to the client
});


// Create a dynamic route for testing the db with an ID parameter
app.get("/db_test/:id", function(req, res) {
    // Capture the 'id' parameter from the URL
    const id = req.params.id;

    // SQL query that selects only the 'name' field from the row matching the ID
    const sql = 'SELECT name FROM test_table WHERE id = ?';

    // Execute the query, passing the ID to protect against SQL injection
    db.query(sql, [id]).then(results => {
        if (results.length > 0) {
            // Format the output with HTML and a simple colored table
            const htmlResponse = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Database Entry</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f4f4f9; }
                        table {
                            width: 100%;
                            margin-top: 20px;
                            border-collapse: collapse;
                        }
                        th, td {
                            border: 1px solid #ddd;
                            padding: 8px;
                            text-align: left;
                        }
                        th {
                            background-color: #4CAF50;
                            color: white;
                        }
                        td {
                            background-color: #e7ffe7;
                        }
                    </style>
                </head>
                <body>
                    <h1>User Information</h1>
                    <table>
                        <tr>
                            <th>Name</th>
                        </tr>
                        <tr>
                            <td>${results[0].name}</td>
                        </tr>
                    </table>
                </body>
                </html>
            `;
            res.send(htmlResponse);
        } else {
            // Send HTML formatted message if no results found
            res.send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <title>No Entry Found</title>
                </head>
                <body>
                    <p>No entry found with ID: ${id}</p>
                </body>
                </html>
            `);
        }
    }).catch(error => {
        // Send HTML formatted error message
        res.status(500).send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>Database Error</title>
            </head>
            <body>
                <p>Failed to retrieve data from database due to an error: ${error.message}</p>
            </body>
            </html>
        `);
    });
});

*/
