import { Response } from 'express';

export const handleError = (res: Response, statusCode: number, message: string) => {
  return res.status(statusCode).send({
    success: false,
    status: statusCode,
    error: message
  });
};


export const sendResponse = (res: Response, status: number, success: boolean, message: string, data: any = null) => {
  res.status(status).json({
    success,
    status,
    message,
    data
  });
};
