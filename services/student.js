'use strict';

const mysql= require("mysql");
const async = require('async');
var request = require('request');

//connect to database
var mysqlConn=mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'studentdb',
    multipleStatements:true
});

var promise= require("promise");
const { json } = require("body-parser");

mysqlConn.connect((err) => {
    if(!err)
    {
        console.log("Connected");
    }
    else {
        console.log("Connection failed."+JSON.stringify(err, 2, undefined));
    }
});

let student = {
    fetch : function(req, res, next){
        res.send("Done");
        next()
    },
    prevalidate: function(req, res, next){
        let limit=parseInt(req.query.limit);
        if(limit>50) {
            res.send("Limit exceeded!");
        } else {
        next();
        }
    },
    printing: function(req, res, next){
        var limit= (+req.query.limit);
        console.log(limit);
        mysqlConn.query("SELECT * FROM student where status=? LIMIT ?", [req.query.status, limit], (err, rows, fields) => {
            if(!err) {
                console.log(req.params.status);
                console.log(rows);
                res.send(rows);
                next();
            } else {
                console.log("Failed to retrieve data", err);
                let error = new Error("failed to "+err);
                var data = {error: error,"display message":"Failed to "+error};
                req.err=data;
                next(error);
            }
        });
    },
    error: function(err, req, res, next){
            if(err){
                res.send(req.err);
                next();
            } else {
                next();
            }
    },
    printbyID: function(req, res, next) {
        let str="SELECT * FROM student WHERE ID=? AND status= ?";
        let conn= mysqlConn.query(str, [req.params.id, req.query.status], (err, rows, fields) => {
            if(!err)
            {
                res.send(rows);
            }
            else
            {
                console.log(err);
            }
        })
        console.log(conn);
    },
    insert: function(req, res, next){
        let data = { Name: req.body.Name, Age: req.body.Age, Address: req.body.Address};
        let sql = "INSERT INTO student SET ?";
        let query = mysqlConn.query(sql, data,(err, results) => {
          if(err) throw err;
          //always remeber json is key value pairs. key is a set , key does not allow duplication
          // value value can be {a :"1", b: "1"} this is valid .
          let result= {rollno: results.insertId, "displayMsg":"Inserted ID"+results.insertId};
          res.send(result);
        //   console.log(JSON.stringify(results));
        });
    },
    delete: function(req, res, next){
        mysqlConn.query("UPDATE student SET Status='Not Active' WHERE ID=?", [req.params.id], (err, rows, fields) => {
            if(!err) {
                res.send("Deleted.")
                next();
            } else {
                console.log(err);
                next();
            }
        })
    },
    update: function(req, res, next){
        var stud=req.body;
        mysqlConn.query("UPDATE student SET Name=?, Age=?, Address=? WHERE ID = ?", [stud.Name, stud.Age, stud.Address, stud.ID], function (err, rows, fields) {
            if(!err)
            {
                res.send("Updated.")
            } else {
                console.log(err);
            }
        })
    },
    bulkupdate: function(req, res, next) {
        console.log(req.body);
        var size=Object.keys(req.body).length;
        console.log("SIZE:"+size);
        if(size==1) {
          console.log("Put more entries.");
          next();
        } else {
            let recs=req.body;
            async.eachLimit(recs, 2, function(record, callback) {
                console.log(record);
                let jsonobj={ url: 'http://localhost:3000/api/update', method: 'PUT', json: record};
                request( jsonobj, function(error, response, body){
                    console.log(body);
                    if(error){
                        record.error = "failed to insert";
                    }else{
                        record.rollno = body.rollno;
                    }
                })
                callback();
            }, function(err){ 
                if(err) {
                    console.log("Error occured!"+err);
                    res.send(recs);
                    next();
                } else { 
                    console.log("Updated!");
                    res.send(recs);
                    next();
                }
            }) 
        }
    },
    bulkinsert: function(req, res, next){
        var size=Object.keys(req.body).length;
        console.log("SIZE:"+size);
        if(size==1) {
          console.log("Put more entries.");
          next();
        } else {
            let records=req.body;
            async.eachLimit(records, 2, function(record, callback){
                console.log(record);
                let jsonobj= {url: 'http://localhost:3000/api/save',
                method: 'POST',
                json: record};
                request(
                    jsonobj
                  , function(error, response, body){
                      console.log(body);
                    if(error){
                        record.error = "failed to insert";
                    }else{
                        record.rollno = body.rollno;
                    }
                    callback();
                  });                

            },  function(err) {
                let bodyrec=records;
                console.log(records);
                // console.log(records[1].rollno);
                let errcnt=0, sucess=0;
                for(let i=0;i<size;i++) {
                    if(records[i].hasOwnProperty('error')) {
                        errcnt++;
                    } else {
                        sucess++;
                    }
                }
                if(errcnt == 0 & sucess != 0) { // success
                    let sucessobj={"Count": sucess, "msg":"Succefully inserted!", "records":records};
                    res.status(200).send(sucessobj);
                } else if( sucess == 0 & errcnt != 0 ) { //error
                    let errorobj={"Count": errcnt, "msg":"Failed to insert.", "records":records};
                    res.status(402).send(errorobj);
                } else { //partial
                    let partialobj={"Sucess Count": sucess, "Error count": errcnt, "msg":"Succefully inserted!", "records":records};
                    res.status(207).send(partialobj);
                }
            
                //If any of the user creation failed may throw error.
                if( err ) {
                  console.log('unable to create user'+err);
                  next();
                } });
             }
    }
};
function bulk(records){
    let sql = "INSERT INTO student SET ?";
    let query = mysqlConn.query(sql, records,(err, results) => {
          if(err) throw err;
    });
}

function callback() 
{

    console.log("All items inserted!");
}

module.exports= student;