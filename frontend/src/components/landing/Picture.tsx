export interface PictureProps extends Omit<React.HTMLAttributes<HTMLImageElement>, 'width' | 'height' | 'loading'> {
  w: number
  h: number
  srcPng: string
  srcPng2x: string
  srcWebp: string
  srcWebp2x: string
  eager?: boolean
  pictureClassName?: string
}

export function Picture({ w, h, srcPng, srcPng2x, srcWebp, srcWebp2x, eager = false, pictureClassName, className, ...rest }: PictureProps) {
  return (
    <picture className={pictureClassName}>
      <source 
        srcSet={`${srcWebp} 1x, ${srcWebp2x} 2x`}
        type="image/webp"
      />
      <source 
        srcSet={`${srcPng} 1x, ${srcPng2x} 2x`}
        type="image/png"
      />
      <img 
        src={srcPng}
        width={w}
        height={h}
        loading={eager ? 'eager' : 'lazy'}
        className={`select-none pointer-events-none ${className}`}
        {...rest}
      />
    </picture>
  )
}
