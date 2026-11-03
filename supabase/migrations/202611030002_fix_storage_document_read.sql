-- DeepSun Studio — fix: Storage read authorization for agreement documents (two defects in the policy created by 202609300004).
--
-- DEFECT 1 (functional): the policy compared `d.storage_path = name`. Inside the subquery `name` resolves to documents.name (the
--   file's display name), not storage.objects.name, so the condition was practically never true and createSignedUrl() failed for every
--   non-admin member (the download route uses the member's own session).
-- DEFECT 2 (security, latent): the EXISTS subquery was NOT correlated with the object being read. Had any visible document ever satisfied
--   `storage_path = name`, EVERY member of that agreement would have been allowed to read EVERY object of the bucket, including the
--   folders of other agreements. It stayed closed only because the condition was never true (production held 0 documents / 0 objects
--   when this was audited), so nothing leaked, but it was one display name away from a cross-agreement leak.
--
-- New rule (all conditions must hold for a member who is not an agreement admin):
--   * the object is the one a documents row points at (`storage.objects.name` qualified — it can no longer resolve to documents.name);
--   * the object lives in that document's OWN agreement folder (`<agreement_id>/...`), so a documents row cannot expose a file that
--     belongs to another agreement even if an admin writes a foreign storage_path into it (insert policy only checks the row's agreement);
--   * the document is marked investor_visible and the reader is a member of that agreement;
--   * if the document hangs from a project, that project belongs to the same agreement and is investor_visible — exactly the
--     visibility rule of the `documents select permitted` policy, so the file is never more reachable than its database row.
-- Admins keep reading everything inside the folder of the agreements they administer. Uploads, updates and deletes are unchanged.
--
-- Single transaction: the policy is never missing while other sessions run (drop + create are atomic).

begin;

drop policy if exists "storage permitted read agreement documents" on storage.objects;

create policy "storage permitted read agreement documents" on storage.objects for select to authenticated using (
  bucket_id = 'agreement-documents'
  and (
    public.is_agreement_admin(public.storage_agreement_id(storage.objects.name))
    or exists (
      select 1
      from public.documents d
      where d.storage_path = storage.objects.name
        and d.agreement_id = public.storage_agreement_id(storage.objects.name)
        and d.investor_visible
        and public.is_agreement_member(d.agreement_id)
        and (
          d.project_id is null
          or exists (
            select 1 from public.projects p
            where p.id = d.project_id and p.agreement_id = d.agreement_id and p.investor_visible
          )
        )
    )
  )
);

commit;
