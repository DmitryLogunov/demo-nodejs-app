create table products
(
    id         serial  primary key,
    uid        varchar(256),
    currency   varchar(4),
    price      float,
    available   bool,
    total       int,
    remaining   int check (remaining > 0),
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null
);

INSERT INTO products (id, uid, currency, price, available, total, remaining, created_at, updated_at)
VALUES (DEFAULT, '10-year-birthday-sticker-capsule', 'EUR', 0.91, true, 100, 100, DEFAULT, DEFAULT);

INSERT INTO products (id, uid, currency, price, available, total, remaining, created_at, updated_at)
VALUES (DEFAULT, '1st-lieutenant-farlow-swat', 'EUR', 7.17, true, 100, 100, DEFAULT, DEFAULT);

INSERT INTO products (id, uid, currency, price, available, total, remaining, created_at, updated_at)
VALUES (DEFAULT, '2021-community-sticker-capsule', 'EUR', 1.29, true, 100, 100, DEFAULT, DEFAULT);
