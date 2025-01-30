create table users
(
    id              serial  primary key,
    username        varchar(50),
    email           varchar(50),
    password_hash   varchar(256),
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null
);

create unique index users_email_unique_idx on users (email);
