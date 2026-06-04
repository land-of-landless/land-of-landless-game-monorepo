import { Schema, InferSchemaType, model } from "mongoose";
import { authDBConn } from "@/daos/mongodb/connectDB";
import { OAuthProfile } from "./OAuthProfile.ts";

// Define a sub-schema for OAuth profile data
const OAuthProfileSchema = new Schema<OAuthProfile>(
    {
        sub: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        picture: {
            type: String,
            required: true,
        },
    },
    { _id: false }, // Disable _id for sub-documents
);

const UserSchema = new Schema(
    {
        discord: {
            type: OAuthProfileSchema,
            required: false,
        },
        google: {
            type: OAuthProfileSchema,
            required: false,
        },
        x: {
            type: OAuthProfileSchema,
            required: false,
        },
        email: {
            type: String,
            // required: true,
            match: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/i,
        },
        name: {
            type: String,
            required: true,
        },
        avatar: {
            type: String,
        },
    },
    {
        timestamps: true,
    },
);

export type UserType = InferSchemaType<typeof UserSchema>;

// export interface IEventModel extends IEvent, Document {}

const UserModel = authDBConn.model<UserType>("User", UserSchema);
export default UserModel;
