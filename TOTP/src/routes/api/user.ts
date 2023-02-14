const speakeasy = require('speakeasy');
import User, { UserModel } from "../../models/user";
import { Router, Response } from "express";
import HttpStatusCodes from "http-status-codes";
import request from "Request";
const bcrypt = require("bcrypt");
const Joi = require('joi');
const router: Router = Router();

router.post('/signup', async (req: request, res: Response) => {
  const { username, password } = req.body;
  const userSchema = Joi.object().keys({
    username: Joi.string().required(),
    password: Joi.string().required()
  });
  let result = userSchema.validate(req.body);
  console.log(result.error);
  const { value, error } = result;
  const valid = error == null;
  if (!valid) {
    res.json({ message: 'Input validation failed', statusCode: HttpStatusCodes.NOT_ACCEPTABLE, error: result.error });
  }
  else {
    let totpSecret: string;
    const userAlreadyExists = await User.findOne({ username: req.body.username });
    if (userAlreadyExists) {
      res.json({ message: 'User Already Exists', statusCode: HttpStatusCodes.CONFLICT });
    }
    else {
      try {
        const user = new User({
          username,
          password,
          totpSecret
        });
        user.totpSecret = speakeasy.generateSecret({ length: 20 }).base32;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        user.password = hashedPassword;
        let userCreation = await User.create(user);
        res.json({ message: 'User created successfully', statusCode: HttpStatusCodes.CREATED });
      }
      catch (e) {
        res.json({ message: 'Unable to create user', statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR });
      }
    }
  }


});
router.post('/login', async (req: request, res: Response) => {
  const { username, password, totpCode } = req.body;
  const userSchema = Joi.object().keys({
    username: Joi.string().required(),
    password: Joi.string().required(),
    totpCode: Joi.number().required(),
  });
  let result = userSchema.validate(req.body);
  console.log(result.error);
  const { value, error } = result;
  const valid = error == null;
  if (!valid) {
    res.json({ message: 'Input validation failed', statusCode: HttpStatusCodes.NOT_ACCEPTABLE, error: result.error });
  }
  else {
    try {
      let user = await User.findOne({ username: username });
      if (!user) {
        return res.json({ message: 'User not found', statusCode: HttpStatusCodes.NOT_FOUND });
      }
      const verified = speakeasy.totp.verify({
        secret: user.totpSecret,
        encoding: 'base32',
        token: req.body.totpCode,
        window: 2
      });

      if (!verified) {
        return res.json({ message: 'Invalid OTP', statusCode: HttpStatusCodes.CONFLICT });
      }
      let passwordCheck = await bcrypt.compare(req.body.password, user.password);
      if (!passwordCheck) {
        return res.json({ message: 'Invalid password', statusCode: HttpStatusCodes.UNAUTHORIZED });
      }

      return res.json({ message: 'Logged In Successfully', statusCode: HttpStatusCodes.OK });

    }
    catch (e) {
      return res.json({ message: 'unable to login', statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR });
    }

  }

});
export default router;