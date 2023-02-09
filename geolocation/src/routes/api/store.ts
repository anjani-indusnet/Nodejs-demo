import { Router, Response } from "express";
import HttpStatusCodes from "http-status-codes";
import csvParser from 'csv-parser';
import fs from 'fs';
import Store from '../../models/store';

const router: Router = Router();

router.post('/import', async (req, res) => {
    try {
      const stores: any[] = [];
    
      fs.createReadStream('stores.csv')
        .pipe(csvParser())
        .on('data', (data: any) => {
          console.log("data reterived successfully from the csv", data);
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

  router.post('/nearpick', async (req, res) => {
    const { lat, lng } = req.body;
    console.log(lat,lng)
    const maxDistance = 30 * 1000;
    console.log(maxDistance)
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
        }
    ]);
    console.log(stores.length);
    res.json({statusCode:HttpStatusCodes.OK,stores:stores})
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Failed to extract Data' });
  }
    
  });
  export default router;