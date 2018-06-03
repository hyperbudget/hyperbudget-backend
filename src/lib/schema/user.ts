import { Document, Schema, Model, model } from 'mongoose';

export interface User {
  id?: any;
  email: string;
  firstName: string;
  password?: string;

  forAPI(): void;
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

UserSchema.methods.forAPI = function () {
  return {
    id: this.id,
    email: this.email,
    firstName: this.firstName,
  };
};

export const UserModel: Model<IUserModel> = model<IUserModel>("user", UserSchema);
