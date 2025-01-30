CREATE ROLE "user" LOGIN PASSWORD 'p@ssword';

CREATE DATABASE "db-name"
    WITH
    OWNER = "user"
    ENCODING = "UTF8";

GRANT ALL PRIVILEGES ON DATABASE "db-name" TO "user";

