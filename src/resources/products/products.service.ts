import redisClient from '@/core/redis-client/redis-client';
import { BuyProductInput, DBProduct, GetProductsInput, Item, ItemPrices } from '@/resources/products/products.types';
import { PRODUCTS_CASH_REDIS_EXPIRING_PERIOD_IN_SEC, PRODUCTS_CASH_REDIS_PREFIX } from '@/resources/products/products.constant';
import { SkinportApiClientInterface } from '@/core/skinport-api-client/skinport-api-client.types';
import sql from '@/core/db-client/postgres-js-client';

export class ProductsService {
  constructor(private readonly apiClient: SkinportApiClientInterface) {
  }

  public async getProducts(params: GetProductsInput) {
    try {
      const { minPrice, maxPrice, page = 1, limit = 100, tradable } = params;

      const offset = (page - 1) * limit;
      const minPriceKey = minPrice && `:minPrice_${minPrice}` || '';
      const maxPriceKey = maxPrice && `:maxPrice_${maxPrice}` || '';

      const redisProductsDataCashKey =
        `${PRODUCTS_CASH_REDIS_PREFIX}${minPriceKey}${maxPriceKey}:page_${page}:limit_${limit}:tradable_${String(tradable)}`;

      const productsDataCash =
        (await redisClient.hgetall(redisProductsDataCashKey)) || undefined;

      if (productsDataCash?.data) {
        return { data: JSON.parse(productsDataCash.data) }
      }

      const tradableFilter = tradable ? '?tradable=true' : '?tradable=false';

      const { data } = await this.apiClient.sendRequest({
        method: 'GET',
        endpoint: `/items${tradableFilter}`,
      }) as unknown as { status: number; data: Item[] };

      let resultData = (data || []).filter((item: Item) => this.filterByPricesHandler(
        {
          suggested_price: item.suggested_price,
          min_price: item.min_price,
          max_price: item.max_price,
          mean_price: item.mean_price,
          median_price: item.median_price,
        }, minPrice, maxPrice));

      resultData = resultData
        .slice(offset, offset + limit)
        .map((item: Item) => ({
          market_hash_name: item.market_hash_name,
          ...this.getMinTwoPricesHandler({
            suggested_price: item.suggested_price,
            min_price: item.min_price,
            max_price: item.max_price,
            mean_price: item.mean_price,
            median_price: item.median_price,
          }),
        })) as any[];

      const responseData =  {
        filters: {
          minPrice,
          maxPrice,
          tradable,
        },
        page,
        limit,
        total: data.length,
        count: resultData.length,
        data: resultData,
      }

      await redisClient.hset(redisProductsDataCashKey, { data: JSON.stringify(responseData) });
      await redisClient.expire(
        redisProductsDataCashKey,
        PRODUCTS_CASH_REDIS_EXPIRING_PERIOD_IN_SEC,
      );

      return { data: responseData };
    } catch(e) {
      return { status: 'ERROR', info: (e as Error).message };
    }
  }

  /**
   * Good purchases processing
   *
   * @param params
   */
  public async buyGood(params: BuyProductInput) {
    const { userId, goodUid } = params;

    const [product] = await sql`SELECT *
                             FROM products
                             WHERE uid = ${goodUid}` as [DBProduct];

    if (!product) {
      return {
        status: 'ERROR',
        httpCode: 400,
        info: 'good not found'
      }
    }

    if (!product.available || product.remaining === 0) {
      return {
        status: 'ERROR',
        httpCode: 400,
        info: 'good is not available',
      }
    }

    const [userWallet] = await sql`SELECT *
                                   FROM wallets
                                   WHERE user_id = ${userId}
                                     AND currency = ${product.currency}` as [{ id: number; balance: number }];

    if (!userWallet) {
      return {
        status: 'ERROR',
        httpCode: 400,
        info: `user has no wallet in ${product.currency}`
      }
    }

    if (userWallet.balance < product.price) {
      return {
        status: 'ERROR',
        httpCode: 400,
        info: `not enough balance`
      }
    }

    try {
      await sql.begin(async sql => {
        await sql`
            UPDATE wallets
            SET ${sql({ balance: userWallet.balance - product.price }, ['balance'])}
            WHERE id = ${userWallet.id}
        `;

        await sql`
            UPDATE products
            SET ${sql({ remaining: product.remaining - 1 }, ['remaining'])}
            WHERE id = ${product.id}
        `;

        await sql`INSERT INTO users_purchases ${sql([{
          user_id: userId,
          product_id: product.id,
        }])}`;
      });

      const [refreshedUserWallet] = await sql`SELECT *
                                   FROM wallets
                                   WHERE user_id = ${userId}
                                     AND currency = ${product.currency}` as [{ id: number; balance: number; currency: string }];

      return {
        status: 'SUCCESS',
        httpCode: 200,
        data: {
          currency: refreshedUserWallet.currency,
          userBalance: refreshedUserWallet.balance,
        }
      }
    } catch (e) {
      return {
        status: 'SUCCESS',
        httpCode: 400,
        info: (e as Error).message,
      }
    }
  }

  /**
   * The handler for filtering by prices: remove item if the min two prices are out of [minPrice, maxPrice]
   *
   * @param item
   * @param minPrice
   * @param maxPrice
   * @private
   */
  private filterByPricesHandler(
    item: ItemPrices,
    minPrice?: number,
    maxPrice?: number,
  ) {

    const itemSortedByPrices = Object.entries(item).sort((a, b) => a[1] - b[1]);

    if (itemSortedByPrices[0][1] === null || itemSortedByPrices[1][1] === null) {
      return false
    }

    if (minPrice) {
      if (itemSortedByPrices[0][1] < minPrice && itemSortedByPrices[1][1] < minPrice) {
        return false;
      }
    }

    if (maxPrice) {
      if (itemSortedByPrices[0][1] > maxPrice && itemSortedByPrices[1][1] > maxPrice) {
        return false;
      }
    }

    return true;
  }

  /**
   * Returns min two prices of item
   *
   * @param item
   * @private
   */
  private getMinTwoPricesHandler(
    item: {
      suggested_price: number;
      min_price: number;
      max_price: number;
      mean_price: number;
      median_price: number;
    },
  ) {

    const itemSortedByPrices = Object.entries(item).sort((a, b) => a[1] - b[1]);

    return {
      [itemSortedByPrices[0][0]]: itemSortedByPrices[0][1],
      [itemSortedByPrices[1][0]]: itemSortedByPrices[1][1],
    };
  }
}
