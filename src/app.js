const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const router = express.Router();

//Rotas
const index = require('./routes/index');
const profileRoute = require('./routes/profileRoute');

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use('/', index);
app.use('/profile', profileRoute);

module.exports = app;