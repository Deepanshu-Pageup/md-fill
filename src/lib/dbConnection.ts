import mongoose from "mongoose";
import { ConnectionObject } from "@/types";

const connection : ConnectionObject = {}

const dbConnection = async () : Promise<void> => {
    if(connection.isConnected) {
        console.log("ALready Connected to Database");
        return
    }

    try {
       const db = await mongoose.connect(process.env.MONGO_URI || "");
       connection.isConnected = db.connections[0].readyState;
    } catch (error) {
        console.error("MongoDB Error", error);
        throw new Error("Database connection failed");
    }
}

export default dbConnection;
