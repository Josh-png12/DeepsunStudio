-- DeepSun Studio — fix: investors could not open documents an admin marked as visible.
--
-- In 202609300004 the policy compared `d.storage_path = name`. Inside the subquery `name` resolves to documents.name (the
-- file's display name), not storage.objects.name, so the condition was never true and createSignedUrl() failed for every
-- non-admin member (the download route uses the member's own session). The policy fails CLOSED, so nothing leaked; the visible
-- documents were simply unreachable. This re-creates it with the object column qualified. Visibility rules are unchanged:
-- admins read everything in the agreement folder; members read only documents with investor_visible = true.

drop policy if exists "storage permitted read agreement documents" on storage.objects;
create policy "storage permitted read agreement documents" on storage.objects for select to authenticated using (
  bucket_id = 'agreement-documents'
  and (
    public.is_agreement_admin(public.storage_agreement_id(storage.objects.name))
    or exists (
      select 1 from public.documents d
      where d.storage_path = storage.objects.name
        and d.investor_visible
        and public.is_agreement_member(d.agreement_id)
    )
  )
);
