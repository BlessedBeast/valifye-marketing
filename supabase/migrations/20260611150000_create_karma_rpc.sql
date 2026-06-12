-- Atomic comment karma award: idempotent flag, profile counter, audit ledger.

create or replace function public.award_comment_karma(
  p_comment_id uuid,
  p_profile_id uuid,
  p_user_id uuid,
  p_points integer,
  p_event_type text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_karma_awarded boolean;
  v_author_id uuid;
begin
  if p_points is null or p_points <= 0 then
    return false;
  end if;

  select c.karma_awarded, c.author_id
  into v_karma_awarded, v_author_id
  from public.comments c
  where c.id = p_comment_id
  for update;

  if not found then
    return false;
  end if;

  if coalesce(v_karma_awarded, false) then
    return false;
  end if;

  if v_author_id is null
    or v_author_id <> p_user_id
    or v_author_id <> p_profile_id then
    return false;
  end if;

  update public.comments
  set karma_awarded = true
  where id = p_comment_id;

  update public.profiles
  set karma_points = coalesce(karma_points, 0) + p_points
  where id = p_profile_id;

  if not found then
    raise exception 'profile % not found for karma award', p_profile_id;
  end if;

  insert into public.karma_events (user_id, event_type, points, reference_id)
  values (p_user_id, p_event_type, p_points, p_comment_id);

  return true;
end;
$$;

comment on function public.award_comment_karma(uuid, uuid, uuid, integer, text) is
  'Idempotently awards review karma for a comment: sets karma_awarded, bumps profiles.karma_points, logs karma_events.';

revoke all on function public.award_comment_karma(uuid, uuid, uuid, integer, text) from public;
grant execute on function public.award_comment_karma(uuid, uuid, uuid, integer, text) to service_role;
