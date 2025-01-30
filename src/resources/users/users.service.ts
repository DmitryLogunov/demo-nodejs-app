import * as bcrypt from 'bcryptjs';
import sql from '../../core/db-client/postgres-js-client';
import generateToken from '../../core/auth/tokens.utils';
import {
  DBUser,
  UserChangePasswordResponse,
  UserLoginInput,
  UserLoginResponse,
  UserRegisterInput,
  UserRegisterResponse
} from './users.types';
import {
  NOT_UNIQUE_USER_DB_ERROR,
  USERS_SESSIONS_REDIS_EXPIRING_PERIOD_IN_SEC,
  USERS_SESSIONS_REDIS_PREFIX
} from './users.constants';
import redisClient from '../../core/redis-client/redis-client';

export class UsersService {
  /**
   * Creates user
   *
   * @param input
   */
  static async createUser(input: UserRegisterInput): Promise<UserRegisterResponse> {
    const email = input.email?.trim();
    let username = input.username?.trim();
    const password = input.password?.trim();

    if (!email || !password) {
      return {
        status: 'ERROR',
        httpCode: 422,
        info: 'user input validation error: email and password are both required',
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);

    try {
      if (!username) {
        const [{count: usersCount}] = await sql`SELECT COUNT(*) as count
                                                FROM users`;
        username = `user_${parseInt(usersCount) + 1}`;
      }

      await sql`INSERT INTO users ${sql([{
          username, email, password_hash: passwordHash,
      }])}`;

      const [user] = await sql`SELECT *
                               FROM users
                               WHERE email = ${email}`;

      delete user.password_hash;

      return {
        status: 'SUCCESS',
        httpCode: 201,
        data: {user},
      } as UserRegisterResponse;
    } catch (e) {
      const info =
        (e as Error).message === NOT_UNIQUE_USER_DB_ERROR ?
          'email is already using' :
          (e as Error).message;

      return {
        status: 'ERROR',
        httpCode: 400,
        info,
      }
    }
  }

  /**
   * User login
   *
   * @param input
   */
  static async login(input: UserLoginInput): Promise<UserLoginResponse> {
    const email = input.email?.trim();
    const password = input.password?.trim();

    if (!email || !password) {
      return {
        status: 'ERROR',
        httpCode: 422,
        info: 'user input validation error: email and password are both required'
      }
    }

    const [user] = await sql`SELECT *
                             FROM users
                             WHERE email = ${email}` as [DBUser];

    if (!user) {
      return {
        status: 'ERROR',
        httpCode: 401,
        info: 'user not found'
      }
    }

    const redisUserSessionKey = `${USERS_SESSIONS_REDIS_PREFIX}:${email}`;
    const userSession =
      (await redisClient.hgetall(redisUserSessionKey)) || undefined;

    if (userSession?.token) {
      delete user.password_hash;

      return {
        status: 'SUCCESS',
        httpCode: 201,
        data: {user, token: userSession.token},
      };
    }

    const isPasswordValid = await bcrypt.compare(password, String(user.password_hash));

    if (!isPasswordValid) {
      return {
        status: 'ERROR',
        httpCode: 401,
        info: 'password is incorrect'
      }
    }

    const token = generateToken();

    await redisClient.hset(redisUserSessionKey, {token});
    await redisClient.expire(
      redisUserSessionKey,
      USERS_SESSIONS_REDIS_EXPIRING_PERIOD_IN_SEC,
    );

    await redisClient.hset(`${USERS_SESSIONS_REDIS_PREFIX}:${token}`, {email});
    await redisClient.expire(
      `${USERS_SESSIONS_REDIS_PREFIX}:${token}`,
      USERS_SESSIONS_REDIS_EXPIRING_PERIOD_IN_SEC,
    );

    delete user.password_hash;

    return {
      status: 'SUCCESS',
      httpCode: 201,
      data: {user, token},
    };
  };

  /**
   * Changes user's password
   *
   * @param data
   * @param user
   */
  static async updateUserPassword(data: {
    oldPassword: string;
    newPassword: string
  }, user: DBUser): Promise<UserChangePasswordResponse> {
    const { oldPassword, newPassword } = data;

    if (!oldPassword || !newPassword) {
      return {status: 'ERROR', httpCode: 400, info: 'old and new passwords are both required'};
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, String(user.password_hash));

    if (!isOldPasswordValid) {
      return {
        status: 'ERROR',
        httpCode: 401,
        info: 'old password is incorrect'
      }
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    await sql`
        UPDATE users
        SET ${sql({password_hash: newPasswordHash}, ['password_hash'])}
        WHERE id = ${user.id}
    `;

    return {
      status: 'SUCCESS',
      httpCode: 204,
    } as UserChangePasswordResponse;
  };
}
