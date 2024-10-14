import { NextFunction, Request, Response } from "express";
import { z, ZodError } from "zod";

const validateData = (schema: z.ZodObject<any, any> | z.ZodEffects<z.ZodObject<any, any>>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((issue: any) => ({
          message: issue.message,
        }));
        res.status(400).json({ error: "Invalid data", details: errorMessages });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  };
};

export { validateData };
