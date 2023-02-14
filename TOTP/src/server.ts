import bodyParser from "body-parser";
import express from "express";
const session  = require ('express-session');
const passport  = require ('passport');
import connectDB from "../config/database";
import user from "./routes/api/user";
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../../swagger.json');
require('dotenv').config();
const app = express();
// Connect to MongoDB
connectDB();

// Express configuration
app.set("port", process.env.PORT || 5000);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// @route   GET /
// @desc    Test Base API
// @access  Public

app.get("/", (_req, res) => {
  res.send("API Running");
});

app.use("/api/user", user);

const port = app.get("port");
const server = app.listen(port, () =>
  console.log(`Server started on port ${port}`)
);

export default server;