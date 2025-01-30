import { Router } from 'express';

import usersController from '@/resources/users/users.controller';
import goodsController from '@/resources/products/products.controller';

const api = Router()
  .use(usersController)
  .use(goodsController);

export default Router().use('/', api);
