/** Synthetic fixture QA can exercise candidate branches; deployment must pin zero. */
export function fi001AssuranceBuild(): boolean {
  return import.meta.env.VITE_FI001_ASSURANCE_MODE === '1'
}

/** True only for Auth-approved production testers, never synthetic CI. */
export function fi001RestrictedContent(pilotEnabled: boolean): boolean {
  return import.meta.env.PROD && !fi001AssuranceBuild() && pilotEnabled
}
