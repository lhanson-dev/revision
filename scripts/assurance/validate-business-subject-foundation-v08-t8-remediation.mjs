import { loadBusinessSubjectFoundationCandidate } from '../content-factory/load-business-subject-foundation-candidate-v08.mjs'
import mapping from '../../research/aqa-business-7132/2027/SPECIFICATION_MAPPING.mjs'

const EXPECTED_BASE_FINGERPRINT='64c072f188e3581a60787bd6a5556e4ac9ebf097434c6caf42a60d5598f61c53'
const EXPECTED_FRESH_SCOPE=['BUS-FND-006','BUS-FIN-008','BUS-PEO-001','BUS-PEO-007','BUS-PEO-010','BUS-PEO-011','BUS-EXT-003','BUS-EXT-005','BUS-EXT-006','BUS-OPS-005','BUS-STR-002','BUS-STR-007','BUS-STR-008','BUS-STR-009']
const EXPECTED_FACETS={
  'BUS-FND-006':['stakeholder_power_interest_mapping'],
  'BUS-FIN-008':['debt_factoring','crowdfunding'],
  'BUS-PEO-001':['hard_soft_hrm'],
  'BUS-PEO-007':['organic_mechanistic_structures'],
  'BUS-PEO-010':['paternalistic_leadership','tannenbaum_schmidt_continuum'],
  'BUS-PEO-011':['works_councils_employee_consultation','handy_culture_types'],
  'BUS-EXT-003':['emerging_economies_multinationals','local_responsiveness_cost_reduction'],
  'BUS-EXT-005':['carroll_csr_pyramid'],
  'BUS-EXT-006':['triple_bottom_line'],
  'BUS-OPS-005':['kaizen','benchmarking'],
  'BUS-STR-002':['porter_generic_strategies'],
  'BUS-STR-007':['integration_types','retrenchment'],
  'BUS-STR-008':['big_data','data_mining'],
  'BUS-STR-009':['kotter_schlesinger_resistance','strategic_drift']
}
const REQUIRED_PATERNALISTIC_SOURCE='SRC-OER-FRONTIERS-PATERNALISTIC-LEADERSHIP-2020'
const REQUIRED_ESG_REPORTING_SOURCE='SRC-OER-FRONTIERS-ESG-COMMENSURABILITY-2022'
const REQUIRED_SHAREHOLDER_RIGHTS_SOURCE='SRC-GOVUK-SHAREHOLDER-RIGHTS-2026'
const EXPECTED_SHAREHOLDER_RIGHTS_DATE_VERSION='Current page checked 2026-09-29; page updated 2026-09-28'
const ACCEPTED_LICENCES=new Set(['CC_BY_4_0','OGL_V3'])
const BOARD_SOURCE_PATTERN=/(aqa|pearson|ocr|wjec|eduqas|ccea)/i

function exactSet(actual,expected,label){const a=[...actual].sort(),e=[...expected].sort();if(a.length!==e.length||a.some((v,i)=>v!==e[i]))throw new Error(`${label} mismatch: ${JSON.stringify(a)} != ${JSON.stringify(e)}`)}
function requireText(value,label){if(typeof value!=='string'||!value.trim())throw new Error(`${label} missing`)}
function prerequisiteClosure(candidate,seed){const selected=new Set(seed),queue=[...seed];while(queue.length){const id=queue.shift(),node=candidate.nodes.get(id);if(!node)throw new Error(`Closure references unknown node ${id}`);for(const prerequisite of node.prerequisites||[]){if(!candidate.nodes.has(prerequisite))throw new Error(`${id} has unknown prerequisite ${prerequisite}`);if(!selected.has(prerequisite)){selected.add(prerequisite);queue.push(prerequisite)}}}return selected}

const candidate=await loadBusinessSubjectFoundationCandidate()
if(candidate.index.candidate_version!=='v0.8-t8-exact-course-remediation')throw new Error('Unexpected v0.8 candidate version')
if(candidate.nodes.size!==81)throw new Error(`Business v0.8 node count changed: ${candidate.nodes.size}`)
if(candidate.previousCandidateFingerprint!==EXPECTED_BASE_FINGERPRINT)throw new Error('Business v0.8 is not composed over exact v0.7 fingerprint')
exactSet(candidate.freshNodeScope,EXPECTED_FRESH_SCOPE,'v0.8 fresh assurance scope')
if(candidate.v08Overlay.assurance_strategy?.preserved_unchanged_node_count!==67)throw new Error('v0.8 must preserve exactly 67 unchanged node assessments')
if(candidate.v08Overlay.assurance_strategy?.final_integration_review_required!==true)throw new Error('v0.8 must require final changed-scope integration review')
if((candidate.v08Overlay.relationship_patches||[]).length||candidate.v08Overlay.principles?.relationship_edges_changed!==false)throw new Error('v0.8 must not silently change Foundation dependency edges')
if(candidate.v08Overlay.principles?.node_count_changed!==false||candidate.v08Overlay.principles?.node_taxonomy_changed!==false)throw new Error('v0.8 must preserve the 81-node taxonomy')

let facetCount=0
for(const [subjectId,expectedFacetIds] of Object.entries(EXPECTED_FACETS)){
  const facets=candidate.nodes.get(subjectId)?.teaching_content?.course_relevant_named_facets||[]
  exactSet(facets.map((facet)=>facet.id),expectedFacetIds,`${subjectId} named facets`)
  for(const facet of facets){facetCount+=1;requireText(facet.name,`${subjectId}/${facet.id} name`);requireText(facet.explanation,`${subjectId}/${facet.id} explanation`);if(!Array.isArray(facet.key_distinctions)||facet.key_distinctions.length<2)throw new Error(`${subjectId}/${facet.id} needs at least two distinctions`);requireText(facet.application,`${subjectId}/${facet.id} application`);if(!Array.isArray(facet.boundaries)||facet.boundaries.length<2)throw new Error(`${subjectId}/${facet.id} needs at least two boundaries`)}
}
if(facetCount!==22)throw new Error(`Expected 22 structured v0.8 named facets, got ${facetCount}`)

const allNewSources=[...(candidate.v08Overlay.source_additions||[]),...(candidate.v08SourceAugmentations.source_additions||[]),...(candidate.v08SourceAugmentations2.source_additions||[]),...(candidate.v08SourceAugmentations3.source_additions||[])]
for(const source of allNewSources){if(!source.promotion_eligible)throw new Error(`${source.id} is not promotion eligible`);if(!ACCEPTED_LICENCES.has(source.licence_profile))throw new Error(`${source.id} has unexpected licence ${source.licence_profile}`);if(BOARD_SOURCE_PATTERN.test(new URL(source.url).hostname))throw new Error(`${source.id} improperly uses awarding-body material as reusable subject truth`)}
const excluded=new Set((candidate.sources.legacy_promotion_exclusions||[]).map((entry)=>entry.source_id))
for(const id of EXPECTED_FRESH_SCOPE){const row=candidate.rows.get(id);if(!row?.subject_truth_sources?.length)throw new Error(`${id} has no promotion truth sources`);for(const sourceId of row.subject_truth_sources){if(excluded.has(sourceId))throw new Error(`${id} uses excluded source ${sourceId}`);const source=candidate.sourceById.get(sourceId);if(!source?.promotion_eligible)throw new Error(`${id} uses non-promotion source ${sourceId}`);if(BOARD_SOURCE_PATTERN.test(new URL(source.url).hostname))throw new Error(`${id} uses awarding-body domain ${source.url}`)}}
const paternalisticSources=new Set(candidate.rows.get('BUS-PEO-010')?.subject_truth_sources||[])
if(!paternalisticSources.has(REQUIRED_PATERNALISTIC_SOURCE))throw new Error(`BUS-PEO-010 must include direct paternalistic leadership source ${REQUIRED_PATERNALISTIC_SOURCE}`)
const paternalisticSource=candidate.sourceById.get(REQUIRED_PATERNALISTIC_SOURCE)
if(!paternalisticSource?.promotion_eligible||paternalisticSource.licence_profile!=='CC_BY_4_0')throw new Error('Direct paternalistic leadership source must remain promotion-eligible CC BY 4.0')
const esgReportingSources=new Set(candidate.rows.get('BUS-EXT-006')?.subject_truth_sources||[])
if(!esgReportingSources.has(REQUIRED_ESG_REPORTING_SOURCE))throw new Error(`BUS-EXT-006 must include direct ESG reporting source ${REQUIRED_ESG_REPORTING_SOURCE}`)
const esgReportingSource=candidate.sourceById.get(REQUIRED_ESG_REPORTING_SOURCE)
if(!esgReportingSource?.promotion_eligible||esgReportingSource.licence_profile!=='CC_BY_4_0')throw new Error('Direct ESG reporting source must remain promotion-eligible CC BY 4.0')
const shareholderRightsSource=candidate.sourceById.get(REQUIRED_SHAREHOLDER_RIGHTS_SOURCE)
if(!shareholderRightsSource?.promotion_eligible||shareholderRightsSource.licence_profile!=='OGL_V3')throw new Error('Shareholder-rights source must remain promotion-eligible OGL v3')
if(shareholderRightsSource.date_version!==EXPECTED_SHAREHOLDER_RIGHTS_DATE_VERSION)throw new Error(`Shareholder-rights source metadata date mismatch: ${shareholderRightsSource.date_version}`)
const metadataPatchIds=(candidate.v08SourceMetadataPatches?.source_metadata_patches||[]).map((entry)=>entry.source_id)
exactSet(metadataPatchIds,[REQUIRED_SHAREHOLDER_RIGHTS_SOURCE],'v0.8 source metadata patch IDs')

if(!Array.isArray(mapping.requirements)||mapping.requirements.length!==42)throw new Error('AQA mapping must retain 42 governed requirements during Foundation remediation')
const directMapped=new Set(mapping.requirements.flatMap((row)=>row.mapped_subject_node_ids||[]))
if(directMapped.size!==78)throw new Error(`Expected current direct AQA mapping to reference 78 reusable nodes, got ${directMapped.size}`)
const closed=prerequisiteClosure(candidate,directMapped)
if(closed.size!==79)throw new Error(`Expected prerequisite-complete AQA projection to contain 79 nodes, got ${closed.size}`)
if(!closed.has('BUS-MKT-001'))throw new Error('AQA projection closure must restore BUS-MKT-001')
const excludedFromClosed=[...candidate.nodes.keys()].filter((id)=>!closed.has(id))
exactSet(excludedFromClosed,['BUS-PEO-003','BUS-MOD-004'],'AQA prerequisite-complete excluded nodes')
for(const id of closed)for(const prerequisite of candidate.nodes.get(id)?.prerequisites||[])if(!closed.has(prerequisite))throw new Error(`Closure defect: ${id} requires ${prerequisite}`)

const followUp=candidate.v08Overlay.exact_course_projection_follow_up
exactSet(followUp?.restore_subject_node_ids_after_v08_reassurance||[],['BUS-MKT-001'],'documented projection restore set')
exactSet(followUp?.retain_excluded_subject_node_ids_unless_new_dependency_evidence_emerges||[],['BUS-PEO-003','BUS-MOD-004'],'documented retained exclusion set')

console.log(JSON.stringify({
  status:'pass',
  candidateVersion:candidate.index.candidate_version,
  candidateFingerprint:candidate.fingerprint,
  baseFingerprint:candidate.previousCandidateFingerprint,
  nodeCount:candidate.nodes.size,
  changedNodes:candidate.freshNodeScope.length,
  preservedNodes:67,
  structuredNamedFacets:facetCount,
  directPaternalisticLeadershipSource:REQUIRED_PATERNALISTIC_SOURCE,
  directEsgReportingSource:REQUIRED_ESG_REPORTING_SOURCE,
  shareholderRightsSourceDateVersion:shareholderRightsSource.date_version,
  aqaGovernedRequirements:mapping.requirements.length,
  directMappedSubjectNodes:directMapped.size,
  prerequisiteCompleteAqaSubjectNodes:closed.size,
  restoredByClosure:['BUS-MKT-001'],
  excludedAfterClosure:excludedFromClosed,
  nextGate:'fresh_v08_changed_scope_and_integration_reassurance'
},null,2))
