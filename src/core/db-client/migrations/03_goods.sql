create table goods
(
    id         serial  primary key,
    uid        varchar(256),
    currency   varchar(4),
    price      float,
    available   bool,
    total       int,
    remaining   int,
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null
);
