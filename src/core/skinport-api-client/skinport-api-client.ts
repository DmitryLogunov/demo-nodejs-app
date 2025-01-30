import * as dotenv from 'dotenv';
import axios from 'axios';

import { HttpException } from '@/core/errors/http-exception.error';
import { SkinportApiClientInterface } from '@/core/skinport-api-client/skinport-api-client.types';

dotenv.config();

export class SkinportApiClient implements SkinportApiClientInterface {
  private readonly skinportApiUrl: string | null = process.env.SKINPORT_API_URL_PATH || null; // TODO: add validation

  /**
   * Sends API request
   *
   * @param params
   * @private
   */
  public async sendRequest(params: {
    method: string,
    endpoint: string,
    data?: { [key: string]: string | number | null },
    headers?: { [key: string]: string},
  }): Promise<any> {
    if (!this.skinportApiUrl) {
      throw new HttpException(400, 'skinport api url is undefined');
    }

    const { method, endpoint, data, headers } = params;

    if (method === 'POST') {
      return axios.post(
        `${this.skinportApiUrl}/${endpoint}`,
        { ...(data || {}) },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept-Encoding': 'gzip, deflate, br',
            ...(headers || {}),
          },
        },
      );
    }

    if (method === 'GET') {
      return axios.get(`${this.skinportApiUrl}/${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept-Encoding': 'gzip, deflate, br',
          ...(headers || {}),
        },
      });
    }

    throw new HttpException(400, 'unsupported HTTP method');
  }
}
