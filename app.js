const express=require('express');
const app=express();
const path=require('path');
const port=process.env.PORT || 5000;
const cookieParser=require('cookie-parser');
const logger=require('morgan');
var session = require('express-session');


//Import Modules
const indexhome=require('./routes/index');

// EXPRESS SPECIFIC STUFF
app.use(express.static(path.join(__dirname,'public'))); // For serving static files
app.use(express.urlencoded());

// PUG SPECIFIC STUFF
app.set('view engine', 'pug'); // Set the template engine as pug
app.set('views', path.join(__dirname, 'views')); // Set the views directory


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cookieParser());
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
}));

// ENDPOINTS
app.use('/',indexhome);

// START THE SERVER
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`)
  });