// src/components/StarRating.jsx
// Accessible 1-5 star control: real buttons, keyboard focus, hover preview.
import { useState } from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ value, onChange, disabled = false, size = 28 }) => {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          disabled={disabled}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          className="rounded p-0.5 transition-transform hover:scale-110 focus-visible:scale-110 disabled:cursor-not-allowed"
        >
          <Star size={size} className={n <= shown ? 'fill-amber-400 text-amber-400' : 'text-slate-300'} />
        </button>
      ))}
    </div>
  );
};

export const StarDisplay = ({ value, size = 16 }) => (
  <span className="inline-flex" role="img" aria-label={`${value} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((n) => <Star key={n} size={size} className={n <= value ? 'fill-amber-400 text-amber-400' : 'text-slate-300'} />)}
  </span>
);

export default StarRating;
