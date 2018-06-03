import { Document, Schema, Model, model } from 'mongoose';

export type User = {
  id?: any,
  email: string;
  firstName: string,
  password: string,
};

export interface IUserModel extends User, Document {}

export const UserSchema: Schema = new Schema({
  email: String,
  password: String,
  firstName: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: Date,
});

export const UserModel: Model<IUserModel> = model<IUserModel>("user", UserSchema);
