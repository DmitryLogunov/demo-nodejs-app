import { NextFunction, Request, Response, Router } from 'express';

import authenticate from '@/core/auth/authenticate.middleware';
import { SkinportApiClient } from '@/core/skinport-api-client/skinport-api-client';
import { GoodsService } from '@/resources/goods/goods.service';
import { DBUser } from '@/resources/users/users.types';

const apiClient = new SkinportApiClient();
const goodsService = new GoodsService(apiClient);

const router = Router();

/**
 * Get goods list: task 2
 *
 * @auth none
 * @route {GET} /goods
 * @returns goods from https://api.skinport.com/v1/items
 */
router.get('/goods', async (
  req: Request, res: Response,next: NextFunction
) => {
  try {
    const { minPrice, maxPrice, page, limit, tradable } = req.query || {};

    const minPriceApply = minPrice && parseFloat(String(minPrice)) || undefined;
    const maxPriceApply = maxPrice && parseFloat(String(maxPrice)) || undefined;
    const pageApply = parseInt(String(page || 1));
    const limitApply = parseInt(String(limit || 100));
    const tradableApply = !!tradable;

    const { data } = await goodsService.getGoods({
      minPrice: minPriceApply,
      maxPrice: maxPriceApply,
      page: pageApply,
      limit: limitApply,
      tradable: tradableApply,
    })

    res.status(200).json({ data });
  } catch (error) {
    res.status(400).json({ status: 'ERROR', info: (error as Error).message });
  }
});

/**
 * Buy good: task 3
 *
 * @auth required
 * @route {POST} /goods/buy
 */
router.post('/goods/buy', authenticate, async (
  req: Request & { auth?: { user: DBUser }}, res: Response, next: NextFunction
) => {
  try {
    const { status, httpCode, info, data } = await goodsService.buyGood({
      userId: req.auth!.user.id,
      goodUid: req.body.goodUid,
    })

    res.status(httpCode || 200).json({ status, info, data });
  } catch (error) {
    res.status(400).json({ status: 'ERROR', info: (error as Error).message });
  }
});

export default router;
