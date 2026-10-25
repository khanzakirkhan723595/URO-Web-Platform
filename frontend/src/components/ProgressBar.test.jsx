import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProgressBar from './ProgressBar';

describe('ProgressBar', () => {
  it('renders nothing when hidden (-1)', () => {
    const { container } = render(<ProgressBar progress={-1} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows percentage and message', () => {
    render(<ProgressBar progress={42} statusMessage="Running model" />);
    expect(screen.getByText('42%')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '42');
    expect(screen.getByText('Running model')).toBeInTheDocument();
  });

  it('clamps values above 100', () => {
    render(<ProgressBar progress={250} />);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });
});
