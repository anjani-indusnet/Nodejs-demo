import { Router, Response } from "express";
import jwt from "jsonwebtoken";
import HttpStatusCodes from "http-status-codes";
import { Itoken } from "../entities/login";
import axios from "axios";
import querystring from "querystring";
require('dotenv').config();
const logger = require('./../logger');
const redirectURI = "auth/google";
const router: Router = Router();

async function getGoogleAuthURL() {
    const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  const options = {
    redirect_uri: `${process.env.SERVER_ROOT_URI}/${process.env.redirectURI}`,
    client_id: process.env.GOOGLE_CLIENT_ID,
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ].join(" "),
  };
  console.log(options)
  return `${rootUrl}?${querystring.stringify(options)}`;
}

// Getting login URL
router.get('/auth/google/url', async (req, res) => {
    logger.info('return the url')
    return res.json({url:getGoogleAuthURL(),statusCode : HttpStatusCodes.OK});
  }); 

async function getTokens({
  code,
  clientId,
  clientSecret,
  redirectUri,
}:Itoken){
  /*
   * Uses the code to get tokens
   * that can be used to fetch the user's profile
   */
  const url = "https://oauth2.googleapis.com/token";
  const values = {
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  };
 let axiosData = await axios.post(url, querystring.stringify(values), {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  if(axiosData.data){
    return axiosData.data;
  }
  else{
    return null
  }
}

// Getting the user from Google with the code

router.get(`/${redirectURI}`, async (req, res) => {
    const code = req.query.code as string;
  const { id_token, access_token } = await getTokens({
    code,
    clientId:process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    redirectUri: `${process.env.SERVER_ROOT_URI}/${redirectURI}`,
  });

  // Fetch the user's profile with the access token and bearer
const googleUser = await axios
.get(
  `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
  {
    headers: {
      Authorization: `Bearer ${id_token}`,
    },
  });
  if(googleUser){
    logger.info(true);
  }
  else{
    logger.info(false);
    res.json({"message":"error hiting google api",statusCode: HttpStatusCodes.BAD_REQUEST})
  }
 
  const token = jwt.sign(googleUser.data, process.env.JWT_SECRET|| '');

  res.cookie(process.env.COOKIE_NAME || '', token, {
    maxAge: 900000,
    httpOnly: true,
    secure: false,
  });
  res.redirect(process.env.UI_ROOT_URI || '');
  }); 


// Getting the current user
router.get("/auth/me", (req, res) => {
  logger.info("entered into the auth me");
  try {
    //console.log("cookie check", req.cookies[COOKIE_NAME])
    const decoded = jwt.verify(req.cookies[process.env.COOKIE_NAME || ''], process.env.JWT_SECRET || '');
    console.log("decoded", decoded);
    return res.json({decoded,statusCode:HttpStatusCodes.OK});
  } catch (err) {
    console.log(err);
    return res.json({message:"Unable to fetch user Data",statusCode:HttpStatusCodes.UNAUTHORIZED});
  }
});
export default router;