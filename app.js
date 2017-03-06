// Load in the node modules, give them variable names
var express = require('express');
var app = express();
var port = process.env.PORT || 5000
var d3 = require('d3');
var svg = require('./public/svg-generator');

// ejs is a way to make html from static file to a template.
// This can be used to change from html to jade (now pug)
app.engine('html', require('ejs').renderFile); 

// Set the enginge to html
app.set('view engine', 'html');

//Express has access to this folder, called public
app.use(express.static(__dirname + '/public'));

// Specifying the views directory for Express
app.set('views', __dirname + '/views');

// views is directory for all template files
app.get('/', function (req, res) {

	// by default, ejs is trying to render templates from views folder
  	res.render('index.html');
});

app.get('/index', function (req, res) {
  	res.render('index.html');
});

app.get('/visualizations', function (req, res) {
  	res.render('visualizations.html');
});

app.get('/about', function (req, res) {
  	res.render('about.html');
});

app.get('/contact', function (req, res) {
  	res.render('contact.html');
});

app.get('/quartet', function (req, res) {
  	res.render('quartet.html');
});

app.get('/barley', function (req, res) {
  	res.render('barley.html');
});

app.get('/weekly-viz', function (req, res) {
    res.render('weekly-viz.html');
});

app.get('/trumpland1', function (req, res) {
    res.render('trumpland1');
});

app.get('/trumpland2', function (req, res) {
    res.render('trumpland2');
});

app.get('/trumpland3', function (req, res) {
    res.render('trumpland3');
});

app.get('/van-airbnb1', function (req, res) {
    res.render('van-airbnb1');
});

app.get('/van-airbnb2', function (req, res) {
    res.render('van-airbnb2');
});

app.get('/van-airbnb3', function (req, res) {
    res.render('van-airbnb3');
});

app.get('/nothing', function (req, res) {
    res.render('nothing');
});

app.get('/test', function (req, res) {
  	res.render('test.html');
});

//heroku assigns app port randomly. DONT WORRY ABOUT IT
app.set('port', port);

// console log here actually sends to your terminal
app.listen(port, function () {
  console.log('Example app listening on port!', port);
});


