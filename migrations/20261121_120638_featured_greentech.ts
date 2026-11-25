import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import type { Payload, PayloadRequest } from 'payload'

// Home page "Companies we've backed": Greentech replaces EMO Energy in the second slot
// (EMO's only logo is a low-resolution placeholder). Applies only while EMO is still
// featured, so an editor's own choice of featured companies is left alone.

export async function featureGreentech(payload: Payload, req?: PayloadRequest) {
  const context = { disableRevalidate: true }
  const find = async (slug: string) =>
    (await payload.find({ collection: 'companies', where: { slug: { equals: slug } }, limit: 1, depth: 0, req })).docs[0]
  const emo = await find('emo-energy')
  const greentech = await find('greentech-mw')
  if (!emo?.featured || !greentech || greentech.featured) return false
  await payload.update({ collection: 'companies', id: greentech.id, req, context, data: { featured: true, homeOrder: emo.homeOrder ?? 2 } })
  await payload.update({ collection: 'companies', id: emo.id, req, context, data: { featured: false, homeOrder: null } })
  return true
}

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await featureGreentech(payload, req)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Content only; editors can re-feature EMO in the CMS (Portfolio → EMO Energy → Featured).
}
