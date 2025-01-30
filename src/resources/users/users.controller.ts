import { NextFunction, Request, Response, Router } from 'express';

import authenticate from '@/core/auth/authenticate.middleware';

import { COOKIES_USER_SESSION_TOKEN_NAME, USERS_SESSIONS_REDIS_EXPIRING_PERIOD_IN_SEC } from './users.constants';
import { DBUser } from './users.types';
import { UsersService } from './users.service';

const router = Router();

/**
 * Create a user
 *
 * @auth none
 * @route {POST} /users
 * @bodyparam user User
 * @returns user User
 */
router.post('/users', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, httpCode, info, data } = await UsersService.createUser({ ...req.body.user });

    res
      .status(httpCode || 201)
      .json({ status, info, data: data?.user && { user: data.user } || undefined });
  } catch (error) {
    res.status(400).json({ status: 'ERROR', info: (error as Error).message });
  }
});

/**
 * Login
 *
 * @auth none
 * @route {POST} /users/login
 * @bodyparam user User
 * @returns user User
 */
router.post('/users/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, httpCode, info, data } = await UsersService.login(req.body.user);

    if (data?.token) {
      res.cookie(COOKIES_USER_SESSION_TOKEN_NAME, data.token, {
        expires: new Date(Date.now() + USERS_SESSIONS_REDIS_EXPIRING_PERIOD_IN_SEC * 1000),
        httpOnly: true,
      });
    }

    res
      .status(httpCode || 201)
      .json({ status, info, data: data?.user && { user: data.user } || undefined });
  } catch (error) {
    res.status(400).json({ status: 'ERROR', info: (error as Error).message });
  }
});

/**
 * Logout
 *
 * @auth none
 * @route {POST} /users/login
 * @bodyparam user User
 * @returns user User
 */
router.post('/users/logout', authenticate, async (
  req: Request & { auth?: { user?: DBUser }}, res: Response, next: NextFunction) => {
  try {
    const user = req.auth!.user;

    await UsersService.logout(user!.email);

    res.clearCookie(COOKIES_USER_SESSION_TOKEN_NAME);

    res.status(201).json({ status: 'SUCCESS' });
  } catch (error) {
    res.status(400).json({ status: 'ERROR', info: (error as Error).message });
  }
});

/**
 * Get user
 *
 * @auth required
 * @route {GET} /user
 * @returns user User
 */
router.get('/users', authenticate, async (
  req: Request & { auth?: { user?: DBUser }}, res: Response,next: NextFunction
) => {
  try {
    const user = req.auth?.user;

    if (!user) {
      res.status(404).json({ status: 'ERROR', info: 'user not found'})
    }

    if (user?.password_hash) {
      delete user.password_hash;
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(400).json({ status: 'ERROR', info: (error as Error).message });
  }
});

/**
 * Changes the user password
 *
 * @auth required
 * @route {PUT} /user
 * @bodyparam user User
 * @returns user User
 */
router.patch('/users/change-password', authenticate, async (
  req: Request & { auth?: { user: DBUser }}, res: Response, next: NextFunction
) => {
  try {
    if (!req.auth?.user) {
      res
        .status(404)
        .json({ status: 'ERROR', info: 'user not found' });
    }

    const { status, httpCode, info } = await UsersService.updateUserPassword(req.body, req.auth!.user);

    res
      .status(httpCode || 204)
      .json({ status, info });
  } catch (error) {
    res.status(400).json({ status: 'ERROR', info: (error as Error).message });
  }
});

export default router;
