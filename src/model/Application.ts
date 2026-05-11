import mongoose, { MongooseError, Schema } from "mongoose";
import { Application } from "@/types";

export const ApplicationSchema = new Schema<Application>({
  name: {
    type: String,
    required: true,
  },
  phoneno: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  }
});


const ApplicationModel = (mongoose.models.Application as mongoose.Model<Application>) || (mongoose.model<Application>("Application" , ApplicationSchema))

export default ApplicationModel;