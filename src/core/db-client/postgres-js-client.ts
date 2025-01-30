import postgres from 'postgres'
import * as dotenv from 'dotenv';

dotenv.config();

const { host, port, database, username, password } = {
  host: process.env.DATABASE_POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_POSTGRES_PORT || '5432'),
  database: process.env.DATABASE_POSTGRES_DBNAME,
  username: process.env.DATABASE_POSTGRES_USERNAME,
  password: process.env.DATABASE_POSTGRES_PASSWORD,
}

const dsl = `postgres://${username}:${password}@${host}:${port}/${database}`

// TODO: add the validation of DB configuration and client initialization

const sql = postgres(dsl, { host, port, database, username, password });

export default sql;
