import { ServiceHandlerResponse } from '@/core/types';

export type UserRegisterInput = {
  username?: string;
  email: string;
  password: string;
}

export type UserLoginInput = {
  email: string;
  password: string
}

export type DBUser = {
  id: number;
  username: string;
  email: string;
  password_hash?: string;
  created_at: string;
  updated_at: string;
}

export type UserLoginDataResponse = {
  user: unknown;
  token: string;
}

export type UserRegisterResponse = ServiceHandlerResponse<{ user: DBUser }>;
export type UserChangePasswordResponse = ServiceHandlerResponse<{ user: DBUser }>;
export type UserLoginResponse = ServiceHandlerResponse<UserLoginDataResponse>;
