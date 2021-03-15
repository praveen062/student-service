const express = require('express');
const { insert } = require('../services/student');
const router = express.Router();
const student = require('../services/student');
var app=express();

//get all student
router.get('/students', student.prevalidate, student.printing, student.error);

router.get("/_status", student.fetch);
//promise

//get an student
router.get('/students/:id', student.printbyID);

//delete an student
router.delete('/students/:id', student.delete);

//route for insert data
router.post('/save', student.insert);

//bulk insert
router.post('/bulkinsert', student.bulkinsert);

//update an student
router.put('/update', student.update);

//bulk update
router.post('/bulkupdate', student.bulkupdate);

module.exports = router;