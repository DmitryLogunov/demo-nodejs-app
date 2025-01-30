import { ProductsService } from './products.service';
import { GetProductsInput } from "@/resources/products/products.types";
import { SkinportApiClient } from '@/core/skinport-api-client/skinport-api-client';


describe('ProductsService', () => {
  it('getProducts', async () => {
    const apiClient = new SkinportApiClient();
    const productsService = new ProductsService(apiClient);

    const response =
      await productsService.getProducts({} as unknown as GetProductsInput);

    expect(response.data).toBeDefined();
  })

  //TODO: increase unit tests coverage for methods: getGoods(), buyGood()
})
