export default function GradientText({
  children,
  from = "from-blue-500",
  via = "",
  to = "to-cyan-500",
  className = "",
  ...props
}) {
  const gradientClasses = `bg-gradient-to-r ${from} ${via} ${to} bg-clip-text text-transparent`;

  return (
    <span className={`${gradientClasses} ${className}`} {...props}>
      {children}
    </span>
  );
}
