const express = require("express");
const dotenv = require("dotenv");
const morgan = require('morgan');
const connectDb = require('./config/db')
const errorHandler = require('./middleware/error')

// load env varaibles
dotenv.config({ path: "./config/config.env" });

// connect to database
connectDb();

// connecting app
const app = express();

// Body Parser
app.use(express.json());

// Dev logging middleware
if(process.env.NODE_ENV === 'development'){
  app.use(morgan('dev'));
}

// Routes files
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');

// Mount Routers
app.use('/api/v1/bootcamps',bootcamps);
app.use('/api/v1/courses',courses)
// error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, (req, res) => {
  console.log(`Server running in ${process.env.PORT}`.yellow.bold);
});

//Handle unhandled promise
process.on('unhandledRejection',(err,promise)=>{
  console.log(`Error: ${err.message}`.red);
  //close server
  server.close(()=> process.exit(1));
})
