import type { ImgHTMLAttributes, ReactNode } from "react";

interface MediaFrameProps extends ImgHTMLAttributes<HTMLImageElement> {
  caption?: ReactNode | undefined;
}

export function MediaFrame({
  caption,
  className = "",
  ...image
}: MediaFrameProps) {
  return (
    <figure className={`media-frame ${className}`}>
      {caption ? <figcaption>{caption}</figcaption> : null}
      <img {...image} />
    </figure>
  );
}
