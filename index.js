// importing the express module
const express = require('express');
const fileupload = require('express-fileupload');
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
app.use(fileupload());

//importing the mysql module
const mysql = require('mysql2');

//creating a connection to the database
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '****', //password of the database (fictional) 
    database: 'project'

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
    //getting the data from the form
    const name = req.body.name;
    const price = req.body.price;
    const img = req.files.img.name;

    //SQL query
    let sql = `INSERT INTO products (name, price, image_url) VALUES ('${name}', ${price}, '${img}')`;

    //executing the query
    connection.query(sql, (err, result) => {
        if (err) {
            console.log('Error while registering the product');
            throw err;
        }
        req.files.img.mv(__dirname + '/images/' + req.files.img.name);
        console.log('Product registered successfully');

    }); 

    res.redirect('/');
});

// creating a server
app.listen(3000)