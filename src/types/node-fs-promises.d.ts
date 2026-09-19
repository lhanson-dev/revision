declare module 'node:fs/promises' {
  export function mkdir(path: string, options?: { recursive?: boolean }): Promise<string | undefined>
  export function readFile(path: string, encoding: 'utf-8'): Promise<string>
  export function writeFile(path: string, data: string, encoding?: string): Promise<void>
}
