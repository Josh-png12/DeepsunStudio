import type { AgreementMember, MemberRole } from '@/lib/supabase/types'

export type MembershipLike = Pick<AgreementMember, 'agreement_id' | 'user_id' | 'role'>

export function canAccessAgreement(
  userId: string,
  agreementId: string,
  memberships: MembershipLike[],
): boolean {
  return memberships.some(
    (membership) =>
      membership.user_id === userId && membership.agreement_id === agreementId,
  )
}

export function canManageAgreement(
  userId: string,
  agreementId: string,
  memberships: MembershipLike[],
  profileRole?: MemberRole,
): boolean {
  return (
    profileRole === 'admin' ||
    memberships.some(
      (membership) =>
        membership.user_id === userId &&
        membership.agreement_id === agreementId &&
        membership.role === 'admin',
    )
  )
}

export function canAccessAdminRoute(
  userId: string,
  memberships: MembershipLike[],
  profileRole?: MemberRole,
): boolean {
  return (
    profileRole === 'admin' ||
    memberships.some(
      (membership) => membership.user_id === userId && membership.role === 'admin',
    )
  )
}

