create table if not exists shortens(
  id text primary key,
  url text unique,
  count int default 0,
  time bigint
);

