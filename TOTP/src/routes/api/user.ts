const speakeasy = require('speakeasy');
const User = require('../../models/user');
import { Router, Response } from "express";
const router: Router = Router();

router.post('/signup', async (req, res) => {
    const user = new User({
        username: req.body.username,
        password: req.body.password
      });
    
      user.totpSecret = speakeasy.generateSecret({ length: 20 }).base32;
    
      user
        .save()
        .then(function(user:any) {
            console.log(user);
          res.json({
          
            message: 'User created successfully'
          });
        })
        .catch(function(err: any) {
            console.log(err)
        });
  });
  router.post('/login', async (req, res) => {
    User.findOne({ username: req.body.username })
    .then(function(user:any) {
        console.log(user)
      if (!user) {
        return res.status(401).json({
          message: 'Authentication failed'
        });
      }

      const verified = speakeasy.totp.verify({
        secret: user.totpSecret,
        encoding: 'base32',
        token: req.body.totpCode,
        window: 2
      });

      if (!verified) {
        return res.status(401).json({
          message: 'TOTP code is invalid'
        });
      }

      // Check password
      if (user.password !== req.body.password) {
        return res.status(401).json({
          message: 'Authentication failed'
        });
      }

      res.json({
        message: 'Login successful',
        data : user
      });
    })
    .catch(function(err:any) {
        console.log(err);
    });
  });
  export default router;