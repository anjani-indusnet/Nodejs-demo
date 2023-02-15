import { Router, Response } from "express";
import HttpStatusCodes from "http-status-codes";
import csvParser from 'csv-parser';
import { exec } from 'child_process';
import fs from 'fs';
import Store from '../../models/store';
import request from "Request";
const logger = require('./../../logger');
var path = require('path');
require('dotenv').config();

const router: Router = Router();

router.post('/nearpick', async (req:request, res:Response) => {
    const { lat, lng } = req.body;
     
    let pageNumber :number = + req.query.pageNumber;
    let pageSize :number = + req.query.pageSize;

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
    res.json({message: "Data reterived successfully",statusCode:HttpStatusCodes.OK,stores:stores})
  } catch (error) {
    logger.error(error);
    res.json({message: "Failed to extract Data" ,statusCode:HttpStatusCodes.INTERNAL_SERVER_ERROR})
  }
    
  });
  router.post('/import', async (req:request, res:Response) => {
    try {
      
      const stores: any[] = [];
    
      fs.createReadStream('stores.csv')
        .pipe(csvParser())
        .on('data', (data: any) => {
          console.log("data reterived successfully from the csv");
          console.log(data.storeName)
          stores.push({
            storeName: data.storeName,
            storeLocation: {
              type: 'Point',
              coordinates: [
                parseFloat(data.long),
                parseFloat(data.lat)
              ]
            }
          });
        })
        .on('end',async () => {
          await Store.create(stores, function(err, stores) {
            console.log("data went for the store",stores);
            if (err) { 
              console.log(err)
              return err
            }
            res.json({ message: 'Stores imported successfully',statusCode:HttpStatusCodes.OK, data: stores});
          });
  
         // res.json({ message: 'CSV imported successfully' });
        });
    } catch (error) {
      res.status(500).json({ message: 'Failed to import CSV' });
    }
  });
  export default router;