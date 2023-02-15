import { Router, Response } from "express";
import HttpStatusCodes from "http-status-codes";
const { exec, spawn } = require('child_process');
import Store from '../../models/store';
import request from "Request";
const logger = require('./../../logger');
var path = require('path');
require('dotenv').config();

const router: Router = Router();

router.post('/nearpick', async (req: request, res: Response) => {
  const { lat, lng } = req.body;
  let pageNumber: number = + req.query.pageNumber;
  let pageSize: number = + req.query.pageSize;

  const maxDistance = 30 * 1000;
  try {
    const stores = await Store.aggregate([
      {
        "$geoNear":
        {
          near: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          key: "storeLocation",
          maxDistance: maxDistance,
          spherical: true,
          distanceField: 'distance'
        }
      },
      { $skip: pageNumber * pageSize },
      { $limit: pageSize }
    ]);
    logger.debug(`This is the length of the stores ${stores.length}`);
    logger.info("Data reterived successfully");
    res.json({ message: "Data reterived successfully", statusCode: HttpStatusCodes.OK, stores: stores })
  } catch (error) {
    logger.error(error);
    res.json({ message: "Failed to extract Data", statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR })
  }

});
router.post('/import-csv', (req: request, res: Response) => {
  try{
    const filePath = 'C:/Users/anjan/OneDrive/Documents/Nodejs-demo/geolocation/stores.csv';

    const command = `mongoimport --type csv --fields "lat,lon,storeName" --db ${process.env.dbName} --collection ${process.env.collectionName} --file ${filePath}`;
  
    exec(command, (err: object, stderr: object) => {
      if (err) {
        console.error(`Error: ${err}`);
        res.json({ message: "Failed to import Data", statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR })
      }
      if (stderr) {
        console.error(`Stderr: ${stderr}`);
        res.json({ message: "Failed to import Data", statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR })
      }
      console.log(`Imported data into ${process.env.dbName}.${process.env.collectionName}`);
      res.json({ message: "Data imported successfully", statusCode: HttpStatusCodes.CREATED })
    });
  }
  catch(e){
    res.json({ message: "Internal Server Error", statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR })
  }
  
});
export default router;