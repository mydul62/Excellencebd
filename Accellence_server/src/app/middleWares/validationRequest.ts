import { NextFunction, Request, Response } from "express"
import { AnyZodObject } from "zod"

export const validateRequest = (schema:AnyZodObject)=>{
    return async(req:Request,res:Response,next:NextFunction)=>{
        try{
            const parsed = await schema.parseAsync({body:req.body})
            // Replace req.body with the coerced/transformed output so downstream
            // handlers receive the correct types (e.g. isActive: "true" → true)
            req.body = parsed.body
            return next()
        }
        catch(error){
            next(error)
        }
    }
}