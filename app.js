// app.js
const express = require('express');
const bodyParser = require('body-parser');
const infonode = require('./routes/infonode.route'); // Imports routes for the infonodes
const app = express();


// Set up mongoose connection
//https://mlab.com/databases/helios/collections/infonodes
const mongoose = require('mongoose');
let dev_db_url = 'mongodb://heliosapp:admin2018@ds045622.mlab.com:45622/helios';
const mongoDB = process.env.MONGODB_URI || dev_db_url;

mongoose.connect(mongoDB, {useNewUrlParser: true});
mongoose.Promise = global.Promise;

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use('/infonode', infonode);


let port = 1234;

app.listen(port, () => {
    console.log('Server is up and running on port number ' + port);
});