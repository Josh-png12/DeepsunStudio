-- DeepSun Studio — ROLLBACK of 202611030002_fix_storage_document_read.sql
--
-- Restores the Storage read policy EXACTLY as it was in production (svbvkgvtjksvjfvigiah) on 2026-11-04, captured read-only from pg_policies
-- before the migration was applied. WARNING: that definition is the one with the two defects described in 202611030002 (the subquery
-- compares d.storage_path = d.name, so documents are unreadable for members and, if a document ever had name = storage_path, every member
-- could read every object of the bucket). Roll back only if the new policy blocks legitimate reads and cannot be fixed forward.
-- Single transaction. Idempotent.

begin;

drop policy if exists "storage permitted read agreement documents" on storage.objects;

create policy "storage permitted read agreement documents" on storage.objects for select to authenticated using (
  (bucket_id = 'agreement-documents'::text)
  and (
    public.is_agreement_admin(public.storage_agreement_id(name))
    or (exists (
      select 1 from public.documents d
      where ((d.storage_path = d.name) and d.investor_visible and public.is_agreement_member(d.agreement_id))
    ))
  )
);

commit;
