// Textures go through Next's image optimiser (resized, WebP/AVIF) instead of full-size originals.
export const imgUrl = (src: string, w = 1080) => `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=75`;
