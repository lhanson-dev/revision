import { contentFactoryJobSchema, type ContentFactoryJob } from './schema'

const JOB_MARKER = '<!-- revision-content-factory-job:v1 -->'
const JOB_BLOCK_PATTERN = /<!-- revision-content-factory-job:v1 -->\s*```json\s*([\s\S]*?)\s*```/

export function serializeJobIssueBody(jobInput: ContentFactoryJob): string {
  const job = contentFactoryJobSchema.parse(jobInput)
  const identity = job.courseIdentity
    ? `${job.courseIdentity.awardingBody} ${job.courseIdentity.qualification} ${job.courseIdentity.subject} (${job.courseIdentity.specificationId})`
    : 'Course identity pending'

  return [
    '# Revision Content Factory job',
    '',
    `**Job:** ${job.jobId}`,
    `**Course:** ${identity}`,
    `**State:** \`${job.state}\``,
    '',
    'This issue is the durable operational record for the Content Factory. It is not educational authority, publication approval or merge approval.',
    '',
    JOB_MARKER,
    '```json',
    JSON.stringify(job, null, 2),
    '```',
    '',
  ].join('\n')
}

export function parseJobIssueBody(body: string): ContentFactoryJob {
  const match = body.match(JOB_BLOCK_PATTERN)
  if (!match?.[1]) throw new Error('Content Factory job payload was not found in the issue body')

  let parsed: unknown
  try {
    parsed = JSON.parse(match[1])
  } catch (error) {
    throw new Error(`Content Factory job payload is not valid JSON: ${error instanceof Error ? error.message : 'unknown parse error'}`)
  }

  return contentFactoryJobSchema.parse(parsed)
}

export interface ContentFactoryIssueClient {
  createIssue(input: { title: string; body: string }): Promise<{ number: number }>
  getIssue(issueNumber: number): Promise<{ number: number; body: string | null }>
  updateIssue(issueNumber: number, input: { body: string }): Promise<void>
}

export class GitHubIssueJobStore {
  constructor(private readonly client: ContentFactoryIssueClient) {}

  async create(jobInput: ContentFactoryJob): Promise<{ issueNumber: number; job: ContentFactoryJob }> {
    const job = contentFactoryJobSchema.parse(jobInput)
    const issue = await this.client.createIssue({
      title: `Content Factory: ${job.jobId}`,
      body: serializeJobIssueBody(job),
    })

    return { issueNumber: issue.number, job }
  }

  async load(issueNumber: number): Promise<ContentFactoryJob> {
    const issue = await this.client.getIssue(issueNumber)
    if (!issue.body) throw new Error(`Content Factory issue #${issueNumber} has no body`)
    return parseJobIssueBody(issue.body)
  }

  async save(issueNumber: number, jobInput: ContentFactoryJob): Promise<ContentFactoryJob> {
    const job = contentFactoryJobSchema.parse(jobInput)
    await this.client.updateIssue(issueNumber, { body: serializeJobIssueBody(job) })
    return job
  }
}
