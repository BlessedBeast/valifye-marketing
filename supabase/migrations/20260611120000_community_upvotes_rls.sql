-- Community upvotes: authenticated users may read/insert/delete only their own rows.
-- Server actions also verify auth before writes; these policies support client-scoped reads.

alter table public.upvotes enable row level security;

drop policy if exists "upvotes_select_own" on public.upvotes;
create policy "upvotes_select_own"
  on public.upvotes
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "upvotes_insert_own" on public.upvotes;
create policy "upvotes_insert_own"
  on public.upvotes
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "upvotes_delete_own" on public.upvotes;
create policy "upvotes_delete_own"
  on public.upvotes
  for delete
  to authenticated
  using (auth.uid() = user_id);
