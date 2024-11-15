import expressAsyncHandler from "express-async-handler";
import { z } from "zod";
import { ErrorResponse } from "./errorHandler.js";

const validateData = (schema: z.ZodObject<any, any> | z.ZodEffects<z.ZodObject<any, any>>) =>
  expressAsyncHandler(async (req, res, next) => {
    const result = await schema.safeParseAsync(req.body);

    if (result.success) {
      req.body = result.data;
      next();
    } else {
      const errors = result.error.flatten().fieldErrors;
      const firstError = Object.values(errors)[0]?.[0];

      return next(new ErrorResponse(firstError || "Bad Request", 400));
    }
  });

export { validateData };
