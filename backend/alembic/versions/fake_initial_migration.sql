-- fakes initial migration by creating alembic_version table with needed value
-- do not run if table already exists, just change the value there instead.

create table alembic_version
(
    version_num VARCHAR(32) not null
        constraint alembic_version_pkc
            primary key
);

insert into alembic_version values ('289e08d5b01f');
