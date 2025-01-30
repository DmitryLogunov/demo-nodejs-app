create table wallets
(
    id         serial  primary key,
    user_id    int,
    currency   varchar(4),
    balance    float check (balance > 0),
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null,
    foreign key (user_id) references users (id)
);

create unique index wallets_unique_idx on wallets (user_id, currency);
