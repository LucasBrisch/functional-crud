// importing the express module
const express = require('express');
const fileupload = require('express-fileupload');
const app = express();


// importing express-handlebars
const {engine} = require('express-handlebars');

// adding bootstrap to the project
app.use('/bootstrap', express.static('./node_modules/bootstrap/dist'));
app.use('/css', express.static('./css'));
app.use('/images', express.static('./images'));

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
const fs = require('fs');

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
    //SQL query
    let sql = 'SELECT * FROM products';

    //executing the query
    connection.query(sql, (err, result) => {
        if (err) {
            console.log('Error while fetching the products');
            throw err;
        }
        res.render('form', {products: result});
    });
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

//remove route
app.get('/remove/:ID&:image_url', (req, res) => {
    let sql = `DELETE FROM products WHERE id = ${req.params.ID}`;

    connection.query(sql, (err, result) => {
        if (err) {
            console.log('Error while deleting the product');
            throw err;
        }
        fs.unlink(__dirname + '/images/' + req.params.image_url, (err) => {
            if (err) {
                console.log('Error while deleting the image');
                throw err;
            }
            console.log('Product deleted successfully');
        });

        res.redirect('/');
    })
})

app.get('/edit/:ID', (req, res) => {
    let sql = `SELECT * FROM products WHERE id = ${req.params.ID}`;

    connection.query(sql, (err, result) => {
        if (err) {
            console.log('Error while fetching the product');
            throw err;
        }
        res.render('EditForm', {product: result[0]});
    });
});

app.post('/editform', (req, res) => {

    //getting the data from the form
    const name = req.body.name;
    const price = req.body.price;
    let id = req.body.identificator;
    let img_name = req.body.image_url;  //old image name
    

    try{
        let NewImg = req.files.img.name;
        let sql = `UPDATE products SET name = '${name}', price = ${price}, image_url = '${NewImg}' WHERE ID = ${id}`;
        
        connection.query(sql, (err, result) => {
            if (err) {
                console.log('Error while updating the product');
                throw err;
            }
            req.files.img.mv(__dirname + '/images/' + req.files.img.name);
            fs.unlink(__dirname + '/images/' + img_name, (err) => {
                if (err) {
                    console.log('Error while deleting the image');
                    throw err;
                }
                console.log('Product updated successfully'); });

            
        });

    } catch (err) {
        let sql = `UPDATE products SET name = '${name}', price = ${price} WHERE id = ${id}`;

        connection.query(sql, (err, result) => {
            if (err) {
                console.log('Error while updating the product');
                throw err;
            }
            console.log('Product updated successfully');
        })

    }


    res.redirect('/');
    
})
    
// creating a server
app.listen(3000)