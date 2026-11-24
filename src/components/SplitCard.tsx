import { type ReactNode } from "react";
import { Link } from "react-router-dom";

export type SplitCardProps = {
  image: string;
  imageAlt?: string;
  tag?: string;
  title: string;
  description: string;
  href?: string;
  accent?: string;
  bgTint?: string;
  linkLabel?: string;
  className?: string;
  footer?: ReactNode;
  onClick?: () => void;
};

export function SplitCard({
  image,
  imageAlt = "",
  tag,
  title,
  description,
  href,
  accent = "var(--marigold)",
  bgTint = "var(--line)",
  linkLabel = "View",
  className = "",
  footer,
  onClick,
}: SplitCardProps) {
  const body = (
    <>
      <div className="split-card-media">
        <div className="split-card-media-inner">
          <img src={image} alt={imageAlt} loading="lazy" decoding="async" />
        </div>
      </div>
      <div className="split-card-text" style={{ ["--split-bg" as string]: bgTint, ["--split-accent" as string]: accent }}>
        {tag ? (
          <span className="split-card-tag" style={{ color: accent }}>
            {tag}
          </span>
        ) : null}
        <h3 className="split-card-title">{title}</h3>
        <p className="split-card-desc">{description}</p>
        {footer}
        {href ? (
          <span className="split-card-link" style={{ color: accent }}>
            {linkLabel} →
          </span>
        ) : null}
        {onClick && !href ? (
          <span className="split-card-link" style={{ color: accent }}>
            {linkLabel} →
          </span>
        ) : null}
      </div>
    </>
  );

  const cls = `split-card card card--split${className ? ` ${className}` : ""}`;

  if (href) {
    return (
      <Link to={href} className={cls} style={{ ["--split-accent" as string]: accent }}>
        {body}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button type="button" className={cls} onClick={onClick} style={{ ["--split-accent" as string]: accent }}>
        {body}
      </button>
    );
  }

  return <div className={cls}>{body}</div>;
}