import { Document, Schema, Model, model } from 'mongoose';

export interface AllowedUser {
  email: string;
};

export interface IAllowedUsersModel extends AllowedUser, Document {}

export const AllowedUserSchema: Schema = new Schema(
  {
    email: String,
  }
);

export const AllowedUserModel: Model<IAllowedUsersModel> = model<IAllowedUsersModel>("allowedUser", AllowedUserSchema, "allowedUsers");
