export type GetProductsInput = {
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  tradable?: boolean;
}

export type GetProductsResponse = {
  status?: 'SUCCESS' | 'ERROR';
  info?: string;
  data?: {
    filters: {
      minPrice?: number;
      maxPrice?: number;
      tradable: boolean;
    },
    page: number;
    limit: number;
    total: number;
    count: number;
    data: unknown[];
  }

};

export type Item = {
  market_hash_name: string;
  suggested_price: number;
  min_price: number;
  max_price: number;
  mean_price: number;
  median_price: number;
}

export type ItemPrices = {
  suggested_price: number;
  min_price: number;
  max_price: number;
  mean_price: number;
  median_price: number;
}

export type BuyProductInput = {
  userId: number;
  goodUid: string;
}

export type DBProduct = {
  id: number;
  uid: string;
  currency: string;
  price: number;
  available: boolean;
  total: number;
  remaining: number;
  created_at: number;
  updated_at: number;
}
