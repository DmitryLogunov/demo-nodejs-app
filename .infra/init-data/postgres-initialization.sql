CREATE ROLE "user" LOGIN PASSWORD 'p@ssword';

CREATE DATABASE "data-loana-db"
    WITH
    OWNER = "user"
    ENCODING = "UTF8"
    CONNECTION LIMIT = -1;

GRANT ALL PRIVILEGES ON DATABASE "data-loana-db" TO "user";

