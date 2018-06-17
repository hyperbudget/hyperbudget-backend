import { Document, Schema, Model, model } from 'mongoose';
import { Category } from '@hyperbudget/hyperbudget-core';

export interface User {
  id?: any;
  email: string;
  firstName: string;
  password?: string;
  preferences?: {
    categories: Category[],
  };

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
  preferences: {
    categories: [{}],
  }
});

UserSchema.methods.forAPI = function () {
  return {
    id: this.id,
    email: this.email,
    firstName: this.firstName,
    preferences: this.preferences,
  };
};

export const UserModel: Model<IUserModel> = model<IUserModel>("user", UserSchema);
