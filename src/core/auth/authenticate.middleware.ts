import { Request, Response, NextFunction } from 'express';
import { USERS_SESSIONS_REDIS_PREFIX } from '../../resources/users/users.constants';
import redisClient from '../redis-client/redis-client';
import sql from '../db-client/postgres-js-client';
import { DBUser } from '../../resources/users/users.types';

const getTokenFromHeaders = (req: Request): string | null => {
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    return req.headers.authorization.split(' ')[1];
  }

  return null;
};

const authenticate =
  async (req: Request & { auth?: { user?: DBUser }}, res: Response, next: NextFunction) => {
    const token = getTokenFromHeaders(req);

    if (!token) {
      res.status(401).json({ info: 'Unauthorized' });

      return;
    }

    const redisUserSessionKey = `${USERS_SESSIONS_REDIS_PREFIX}:${token}`;
    const userSession =
      (await redisClient.hgetall(redisUserSessionKey)) || undefined;

    if (!userSession?.email ) {
      res.status(401).json({ status: 'ERROR', info: 'Unauthorized' });

      return;
    }

    const [user] = await sql`SELECT * FROM users WHERE email = ${userSession.email}` as [DBUser];

    if (!user) {
      res.status(401).json({ status: 'ERROR', info: 'Unauthorized' });

      return;
    }

    req.auth = { user };

    return next();
}

export default authenticate;
