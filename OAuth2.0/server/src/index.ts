import bodyParser from "body-parser";
import express from "express";
const session  = require ('express-session');
import cookieParser from "cookie-parser";
var morgan = require('morgan');
const logger = require('./logger');
import oauthRouter from "./routes/login";
import cors from "cors";
require('dotenv').config();
const app = express();
// Express configuration//
app.set("port", process.env.PORT || 4000);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(morgan('combined'));
app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }));
app.use(
  cors({
    // Sets Access-Control-Allow-Origin to the UI URI
    origin: process.env.UI_ROOT_URI,
    // Sets Access-Control-Allow-Credentials to true
    credentials: true,
  })
);
app.use("/", oauthRouter);

const port = app.get("port");
const server = app.listen(port, () =>{
  logger.info(process.env.UI_ROOT_URI)
  logger.info(`Server started on port ${port}`)
});

export default server;