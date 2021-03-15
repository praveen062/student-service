const express=require("express");
const mysql= require("mysql");
const bodyParser= require("body-parser");
var cors= require('cors');
var path = require('path');
const router = express.Router();

module.exports = router ;
//configure node js application
var app=express();

const route= require('./routes/route');

//connect to database
var mysqlConn=mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'studentdb',
    multipleStatements:true
});

var promise= require("promise");

mysqlConn.connect((err) => {
    if(!err)
    {
        console.log("Connected");
    }
    else{
        console.log("Connection failed."+JSON.stringify(err, 2, undefined));
    }
});

//Add middleware
app.use(cors());
app.use(bodyParser.json());

//to keep static files
app.use(express.static(path.join(__dirname,'public')));

//routesss
app.use('/api',  require('./routes/route'));

//testing server
app.get('/',(req, res)=>{
    res.send('foobar');
});
const port = process.env.PORT || 3000;
app.listen(port, ()=>console.log("server is running at port 3000"));

module.exports = app;
