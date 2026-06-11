export default function BrandLogo({
  className = "",
  textClassName = "text-white text-2xl",
  iconSize = 40,
  iconSrc = "/dabby-logo.svg",
  label = "Dabby",
}) {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <img
        src={iconSrc}
        alt={`${label} logo`}
        className="shrink-0"
        style={{ width: iconSize, height: iconSize }}
        loading="lazy"
        decoding="async"
      />
      <span className={`font-semibold tracking-tight ${textClassName}`}>{label}</span>
    </div>
  );
}
