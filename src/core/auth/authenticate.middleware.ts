import { Request, Response, NextFunction } from 'express';

const getTokenFromHeaders = (req: Request): string | null => {
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    return req.headers.authorization.split(' ')[1];
  }

  return null;
};

const authenticate =
  (req: Request, res: Response, next: NextFunction) => {
  return next();
}

export default authenticate;
