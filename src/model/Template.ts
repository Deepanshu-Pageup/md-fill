import { ITemplate } from "@/types";
import mongoose, { model, models, Schema } from "mongoose";

const TemplateSchema = new Schema<ITemplate>({
    name: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true,
    },
    updatedAt: {
        type: Date,
        default: Date.now()
    }
})

const TemplateModel = (mongoose.models.Template as mongoose.Model<ITemplate>) || (mongoose.model<ITemplate>("Template" , TemplateSchema));
export default TemplateModel;