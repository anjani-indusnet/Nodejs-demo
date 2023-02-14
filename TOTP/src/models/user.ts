import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true,
    unique: true
  },
  totpSecret: {
    type: String,
    required: true,
    unique: true
  }
});

const User = mongoose.model<UserModel>('User', userSchema);

export interface UserModel extends mongoose.Document {
  username: string;
  password: string;
  totpSecret:string;
}

export default User;