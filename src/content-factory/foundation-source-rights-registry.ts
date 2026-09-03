import { z } from 'zod'
import {
  foundationSourceRightsPolicyRuleSchema,
  fingerprintFoundationArtifact,
  type FoundationSourceRightsPolicyRule,
} from './foundation-compilation'

const nonEmptyStringSchema = z.string().min(1)
const commitShaSchema = z.string().regex(/^[0-9a-f]{40}$/)

export const foundationSourceRightsRegistrySchema = z.object({
  schemaVersion: z.literal(1),
  registryId: nonEmptyStringSchema,
  registryVersion: z.number().int().positive(),
  status: z.literal('governed_main_only'),
  authorityRef: nonEmptyStringSchema,
  approvalEvidence: z.object({
    mechanism: z.literal('founder_approved_governed_main'),
    repository: nonEmptyStringSchema,
    branch: z.literal('main'),
    note: nonEmptyStringSchema,
  }),
  rules: z.array(foundationSourceRightsPolicyRuleSchema).min(1),
})

export type FoundationSourceRightsRegistry = z.infer<typeof foundationSourceRightsRegistrySchema>

export const FOUNDATION_SOURCE_RIGHTS_REGISTRY: FoundationSourceRightsRegistry = foundationSourceRightsRegistrySchema.parse({
  schemaVersion: 1,
  registryId: 'revision-foundation-source-rights',
  registryVersion: 1,
  status: 'governed_main_only',
  authorityRef: '40-evidence-and-trust/Educational Content Source Licensing and Provenance Standard.md',
  approvalEvidence: {
    mechanism: 'founder_approved_governed_main',
    repository: 'lhanson-dev/revision',
    branch: 'main',
    note: 'Rules are usable by the live Foundation runtime only after this exact registry version is present on Founder-approved main. Runtime source preflight still revalidates factual licence/source markers before a rule is applied.',
  },
  rules: [
    {
      id: 'govuk-dfe-ogl-v3',
      issuer: 'Department for Education',
      hostnames: ['www.gov.uk'],
      sourceTypes: ['subject_content'],
      useClass: 'OPEN',
      permissionBasis: 'Crown copyright publication on GOV.UK under the Open Government Licence v3.0; the live Foundation source preflight must revalidate the publication and licence marker before admission.',
      aiInputPermitted: true,
      derivedCommercialUsePermitted: true,
      attributionRequirements: ['Attribute Crown copyright and the Open Government Licence v3.0 where required.'],
      restrictions: ['Check any separately identified third-party material before use.'],
      revalidationConditions: ['Publication, licence wording or source composition changes.'],
    },
    {
      id: 'govuk-ofqual-ogl-v3',
      issuer: 'Ofqual',
      hostnames: ['www.gov.uk'],
      sourceTypes: ['assessment_objectives'],
      useClass: 'OPEN',
      permissionBasis: 'Ofqual publication on GOV.UK under the Open Government Licence v3.0; the live Foundation source preflight must revalidate the current page and licence marker before admission.',
      aiInputPermitted: true,
      derivedCommercialUsePermitted: true,
      attributionRequirements: ['Attribute Crown copyright and the Open Government Licence v3.0 where required.'],
      restrictions: ['Check any separately identified third-party material before use.'],
      revalidationConditions: ['Assessment-objective publication, licence wording or source composition changes.'],
    },
    {
      id: 'libretexts-business-cc-by-4',
      issuer: 'LibreTexts',
      hostnames: ['biz.libretexts.org'],
      sourceTypes: ['secondary_supplement'],
      useClass: 'OPEN',
      permissionBasis: 'Business Fundamentals (Brown) is marked CC BY 4.0 by LibreTexts; live Foundation source preflight must revalidate the resource licence and LibreTexts terms before admission.',
      aiInputPermitted: true,
      derivedCommercialUsePermitted: true,
      attributionRequirements: ['Attribute the applicable Business Fundamentals authors / LibreTexts under CC BY 4.0 and preserve source-specific attribution for material actually reused.'],
      restrictions: ['Do not ingest separately marked third-party material under a different licence.'],
      revalidationConditions: ['Resource licence, detailed licensing, LibreTexts terms or source composition changes.'],
    },
    {
      id: 'aqa-reference-only-alignment',
      issuer: 'AQA',
      hostnames: ['www.aqa.org.uk'],
      sourceTypes: ['specification', 'assessment', 'subject_content'],
      useClass: 'REFERENCE_ONLY',
      permissionBasis: 'Conservative implementation of the Founder-approved source licensing standard: awarding-body material is restricted to controlled structured Board Alignment unless broader rights are separately recorded.',
      aiInputPermitted: false,
      derivedCommercialUsePermitted: false,
      attributionRequirements: [],
      restrictions: ['alignment-facts-only', 'no-generative-source-text', 'no-protected-question-or-mark-scheme-ingestion'],
      revalidationConditions: ['AQA specification, terms, copyright policy, qualification cohort or Revision source-use policy changes.'],
    },
  ],
})

export async function loadGovernedFoundationSourceRightsRules(input: {
  repository: string
  gitRef: string
  headSha: string
}): Promise<{
  rules: FoundationSourceRightsPolicyRule[]
  registryFingerprint: string
  approvalEvidenceRef: string
  authorityRef: string
}> {
  if (input.repository !== FOUNDATION_SOURCE_RIGHTS_REGISTRY.approvalEvidence.repository) {
    throw new Error(`foundation_source_rights_registry_repository_mismatch:${input.repository}`)
  }
  if (input.gitRef !== 'refs/heads/main') {
    throw new Error(`foundation_source_rights_registry_requires_approved_main:${input.gitRef}`)
  }
  commitShaSchema.parse(input.headSha)

  const registryFingerprint = await fingerprintFoundationArtifact(FOUNDATION_SOURCE_RIGHTS_REGISTRY)
  return {
    rules: FOUNDATION_SOURCE_RIGHTS_REGISTRY.rules,
    registryFingerprint,
    approvalEvidenceRef: `foundation-source-rights-registry:${FOUNDATION_SOURCE_RIGHTS_REGISTRY.registryId}:v${FOUNDATION_SOURCE_RIGHTS_REGISTRY.registryVersion}:${registryFingerprint}@${input.headSha}`,
    authorityRef: `${FOUNDATION_SOURCE_RIGHTS_REGISTRY.authorityRef}@${input.headSha}`,
  }
}
