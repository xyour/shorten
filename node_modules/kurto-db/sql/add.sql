insert or replace
  into shortens(id, url, time, count)
  values($id, $url, $ts,
    coalesce((select count from shortens where id=$id), 0));

