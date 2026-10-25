// src/components/PageLoader.jsx
const PageLoader = ({ label = 'Loading...', fullScreen = false }) => (
  <div
    className={`flex items-center justify-center ${fullScreen ? 'min-h-screen' : 'min-h-[50vh]'}`}
    role="status"
    aria-live="polite"
  >
    <div className="flex flex-col items-center gap-3 text-slate-500">
      <span className="h-9 w-9 animate-spin rounded-full border-[3px] border-brand-200 border-t-brand-600" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  </div>
);

export default PageLoader;
