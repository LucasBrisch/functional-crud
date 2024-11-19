// importing the express module
const express = require('express');
const app = express();

// importing express-handlebars
const {engine} = require('express-handlebars');

// adding bootstrap to the project
app.use('/bootstrap', express.static('./node_modules/bootstrap/dist'));
app.use('/css', express.static('./css'));

// configuring the express to use handlebars
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', 'views');

//data manipulation
app.use(express.json());
app.use(express.urlencoded({extended: false}));

//importing the mysql module
const mysql = require('mysql2');

//creating a connection to the database
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '2525', //password of the database (fictional) 
});

//connection test
connection.connect((err) => {
    if (err) {
        console.log('Error while connecting to the database');
        return;
    }
    console.log('Connection established with the database');
});

//creating a route
// req = request and res = response, those are the parameters of the function
app.get('/', (req, res) => {
    res.render('form');
});

//regitering the product
app.post('/register', (req, res) => {
    console.log(req.body);
    res.end();
});

// creating a server
app.listen(3000)