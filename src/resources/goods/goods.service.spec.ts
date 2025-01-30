import { GoodsService } from './goods.service';
import { GetGoodsInput } from "@/resources/goods/goods.types";
import { SkinportApiClient } from '@/core/skinport-api-client/skinport-api-client';


describe('GoodsService', () => {
  it('getGoods', async () => {
    const apiClient = new SkinportApiClient();
    const goodsService = new GoodsService(apiClient);

    const response =
      await goodsService.getGoods({} as unknown as GetGoodsInput);

    expect(response.data).toBeDefined();
  })

  //TODO: increase unit tests coverage for methods: getGoods(), buyGood()
})
