// src/components/PageHeader.jsx
// Consistent dark header band for inner pages.
const PageHeader = ({ eyebrow, title, description, children }) => (
  <header className="page-hero">
    <div className="container-page relative py-12 sm:py-16 lg:py-20">
      {eyebrow && (
        <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand-300">
          <span className="h-px w-6 bg-brand-300" /> {eyebrow}
        </p>
      )}
      <h1 className="max-w-3xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">{title}</h1>
      {description && <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">{description}</p>}
      {children && <div className="mt-6">{children}</div>}
    </div>
  </header>
);

export default PageHeader;
