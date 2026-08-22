import type { ImgHTMLAttributes } from 'react'
import revisionWordmarkLight from '../../../assets/brand/exports/revision-wordmark-primary-light.svg?url'
import revisionWordmarkDark from '../../../assets/brand/exports/revision-wordmark-primary-dark.svg?url'
import livingERestingLight from '../../../assets/brand/exports/revision-rev-living-e-resting-light.svg?url'
import livingERestingDark from '../../../assets/brand/exports/revision-rev-living-e-resting-dark.svg?url'
import livingENavLight from '../../../assets/brand/exports/revision-rev-living-e-nav-light.svg?url'
import livingENavDark from '../../../assets/brand/exports/revision-rev-living-e-nav-dark.svg?url'
import { classNames } from './classNames'

export type BrandAssetName = 'wordmark' | 'living-e-resting' | 'living-e-nav'

const brandAssets: Record<BrandAssetName, { light: string; dark: string }> = {
  wordmark: { light: revisionWordmarkLight, dark: revisionWordmarkDark },
  'living-e-resting': { light: livingERestingLight, dark: livingERestingDark },
  'living-e-nav': { light: livingENavLight, dark: livingENavDark },
}

export interface BrandAssetProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  asset: BrandAssetName
}

export function BrandAsset({ asset, className, alt = '', ...props }: BrandAssetProps) {
  const sources = brandAssets[asset]
  return (
    <span className={classNames('ui-brand-asset', className)} data-brand-asset={asset}>
      <img {...props} alt={alt} src={sources.light} className="ui-brand-asset__image ui-brand-asset__image--light" />
      <img {...props} alt={alt} src={sources.dark} className="ui-brand-asset__image ui-brand-asset__image--dark" aria-hidden="true" />
    </span>
  )
}

export function brandAssetSources(asset: BrandAssetName) {
  return brandAssets[asset]
}
