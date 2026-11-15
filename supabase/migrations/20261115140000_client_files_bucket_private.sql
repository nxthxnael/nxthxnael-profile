-- The first migration skipped the bucket if one already existed, so a bucket
-- created earlier as public would have stayed public. Force it private.

update storage.buckets set public = false where id = 'client-files';
