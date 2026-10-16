import { media } from '../content';

interface Props {
  file?: string;
  alt: string;
  /** How wide the picture is shown, for the browser to pick the smallest file that is sharp enough. */
  sizes: string;
  eager?: boolean;
  className?: string;
}

/** A photo from content/media, served in the size the screen needs. */
export function Picture({ file, alt, sizes, eager = false, className }: Props) {
  const info = file ? media[file] : undefined;
  if (!info) return <div className={`picture-missing ${className ?? ''}`} role="img" aria-label={alt} />;
  const largest = info.variants[info.variants.length - 1];
  return (
    <img
      className={className}
      src={largest.src}
      srcSet={info.variants.map((v) => `${v.src} ${v.w}w`).join(', ')}
      sizes={sizes}
      width={info.width}
      height={info.height}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      {...(eager ? { fetchpriority: 'high' } : {})}
    />
  );
}
