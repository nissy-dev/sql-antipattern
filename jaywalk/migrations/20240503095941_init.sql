-- Add migration script here
create table accounts (
  id serial,
  name varchar(255) not null,
  primary key (id)
);

create table products (
  id serial,
  name varchar(255) not null,
  primary key (id)
);

create table contacts (
  account_id bigint unsigned not null,
  product_id bigint unsigned not null,
  primary key (account_id, product_id),
  foreign key (account_id) references accounts (id),
  foreign key (product_id) references products (id)
);
