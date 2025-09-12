export default function Section({ children, className = "", id, ariaLabel }) {
  return (
    <section
      id={id}
      aria-label={ariaLabel}
      className={`py-16 md:py-24 ${className}`}>
      {children}
    </section>
  );
}
