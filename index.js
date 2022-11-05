require("dotenv").config();
const express = require('express');
const movieRoutes = require('./routes/movies')
const cors =require('cors');
const dbConnect = require("./dbConnect");

const app = express();
dbConnect();
app.use(express.json());
app.use(cors())
app.use("/api",movieRoutes)

app.use('/api/users',require('./routes/api/users'))
app.use('/api/auth',require('./routes/api/auth'))
app.use('/api/posts',require('./routes/api/posts'))
app.use('/api/profile',require('./routes/api/profile'))

const port = process.env.PORT || 8080
app.listen(port,()=>{
    console.log("server is running on port 8080")
})
