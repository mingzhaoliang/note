import { NextFunction, Request, Response } from "express";

export class ErrorResponse extends Error {
  public statusCode: number;
  public message: string;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
  }
}

export function errorHandler(err: ErrorResponse, req: Request, res: Response, next: NextFunction) {
  console.error("errorHandler:", err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Server Error",
    data: null,
  });
}
