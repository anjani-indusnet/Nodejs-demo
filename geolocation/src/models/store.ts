import mongoose from 'mongoose';

const storeSchema = new mongoose.Schema({
  storeName: { type: String, required: false },
  storeLocation: {
    type: {
      type: String,
      enum: ['Point'],
      required: false
    },
    coordinates: {
      type: [Number],
      required: true
    }
  }
});
storeSchema.index({ storeLocation: '2dsphere' })
const Store = mongoose.model('Store', storeSchema);
export default Store;
