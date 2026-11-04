/* eslint-disable @next/next/no-img-element */

// The client's BRANDED GENIUS wordmark (vector, from their brand files), shown as is.
export function BrandLogo({ className = "" }: { className?: string }) {
  return <img src="/brand/logo.svg" alt="Branded Genius" width={620} height={172} draggable={false} className={`block h-full w-auto ${className}`} />;
}
