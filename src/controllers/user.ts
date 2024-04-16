import {Request, Response, NextFunction } from "express";
import User from "../models/userModel";
import { CustomError } from "../middlewares/error";

export const register = async(req: Request, res: Response, next: NextFunction) =>{
    try {
      
    } catch (error: any) {
        console.log(error)
        next(new CustomError(error.message))
    }
}

export const login = async(req: Request, res: Response, next: NextFunction) =>{
    try {
      
    } catch (error: any) {
        console.log(error)
        next(new CustomError(error.message))
    }
}

export const logout = async(req: Request, res: Response, next: NextFunction) =>{
    try {
      
    } catch (error: any) {
        console.log(error)
        next(new CustomError(error.message))
    }
}