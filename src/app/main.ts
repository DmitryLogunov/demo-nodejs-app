import { Request, Response } from 'express';
import express from 'express';
import cors from 'cors';
import * as bodyParser from 'body-parser';
import routes from './app/routes';

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(routes);

const HTTP_PORT = process.env.HTTP_PORT || 3000;

app.listen(HTTP_PORT, () => {
  console.info(`Server started on port ${HTTP_PORT}`);
});
