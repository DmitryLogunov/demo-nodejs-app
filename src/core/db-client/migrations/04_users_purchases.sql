create table users_purchases
(
    id         serial  primary key,
    user_id    int,
    product_id    int,
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null,
    foreign key (user_id) references users (id),
    foreign key (product_id) references products (id)
);
