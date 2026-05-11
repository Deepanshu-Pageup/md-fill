import type { Document } from "mongoose";

export type ConnectionObject = {
    isConnected?: number;
}

export interface Application extends Document {
    name: string,
    phoneno: string,
    address: string,
    createdAt?: Date,
}

export interface IApplication {
    name: string;
    phoneno: string;
    address: string;
    createdAt?: Date;
}


export interface ITemplate {
    name: string;
    content: string;
    updatedAt?: Date 
}
