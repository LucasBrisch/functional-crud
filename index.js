// importing the express module
const express = require('express');
const fileupload = require('express-fileupload');
const app = express();
const multer = require('multer');


// importing express-handlebars
const {engine} = require('express-handlebars');
const upload = multer({ dest: 'uploads/' });

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
    password: '2525', //password of the database (fictional) 
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
app.post('/register', upload.single('img'), (req, res) => {
    // Obtendo os dados do formulário
    const { name, price } = req.body;
    const img = req.file;

    if (!req.file) {
        return res.status(400).send('Image upload failed');
    }

    // Lendo o arquivo da imagem como binário
    const imgData = fs.readFileSync(img.path);

    // Query SQL usando placeholders para segurança
    const sql = `INSERT INTO products (name, price, product_image) VALUES (?, ?, ?)`;

    // Executando a query
    connection.query(sql, [name, price, imgData], (err, result) => {
        if (err) {
            console.error('Error while registering the product:', err);
            return res.status(500).send('Database error');
        }
        console.log('Product registered successfully');
        
        // Excluindo o arquivo local (opcional)
        fs.unlinkSync(img.path);

        res.redirect('/');
    });
});

//remove route
app.get('/remove/:ID&:product_image', (req, res) => {
    let sql = `DELETE FROM products WHERE id = ${req.params.ID}`;

    connection.query(sql, (err, result) => {
        if (err) {
            console.log('Error while deleting the product');
            throw err;
        }
        fs.unlink(__dirname + '/images/' + req.params.product_image, (err) => {
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
    let img_name = req.body.product_image;  //old image name
    

    try{
        let NewImg = req.files.img.name;
        let sql = `UPDATE products SET name = '${name}', price = ${price}, product_image = '${NewImg}' WHERE ID = ${id}`;
        
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