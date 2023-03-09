const express = require('express');
const dotenv = require("dotenv");

dotenv.config({path:"./config/config.env"});

const app = express();

const PORT = process.env.PORT || 5000;

app.listen(PORT, (req,res)=>{
    console.log(`Server running in ${process.env.PORT}`)
})