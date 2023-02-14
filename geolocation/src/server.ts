import bodyParser from "body-parser";
import express from "express";
const session  = require ('express-session');
const passport  = require ('passport');
import connectDB from "../config/database";
import store from "./routes/api/store";
var morgan = require('morgan');
const logger = require('./logger');

const app = express();
// Connect to MongoDB
connectDB();

// Express configuration
app.set("port", process.env.PORT || 5000);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan('combined'));
app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
// @route   GET /
// @desc    Test Base API
// @access  Public

app.use("/api/stores", store);

const port = app.get("port");
const server = app.listen(port, () =>{
  logger.info(`Server started on port ${port}`)
});

export default server;