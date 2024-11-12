import { NextFunction, Request, Response } from "express"
import { CustomError } from "../../middlewares/error"
import { Institutes } from "../../models/intitutesModel"

export const getIntitutesLists = async(req: Request, res: Response, next: NextFunction) => {
    try {
      const searchTerm = req.query.q?.toString()
      
      const query: any = {}
      if (searchTerm) query.name = RegExp(searchTerm, 'i')
 
      const institutes = await Institutes.aggregate([
       { $match: query }
      ]).limit(25)
      
      res.status(200).json({
       success: true,
       institutes
      })
    } catch (error) {
     next (new CustomError((error as Error).message))
    }
 }