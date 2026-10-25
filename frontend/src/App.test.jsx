import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// The whole backend layer is faked: nobody is logged in (401 on /users/me).
vi.mock('./services/api', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    default: { get: vi.fn().mockRejectedValue({ response: { status: 401 } }), post: vi.fn(), request: vi.fn() },
    recordPageVisit: vi.fn().mockResolvedValue(null),
    getVisitorStats: vi.fn().mockResolvedValue({ status: 'success', data: { totalPageHits: 10, totalUniqueVisitors: 4 } }),
    getAiStatus: vi.fn().mockResolvedValue(false),
  };
});

import App from './App';

const renderAt = (path) => {
  window.history.pushState({}, '', path);
  return render(<App />);
};

describe('App routing (logged-out visitor)', () => {
  beforeEach(() => window.scrollTo?.());

  it('renders the home page with navigation and footer', async () => {
    renderAt('/');
    expect(await screen.findByRole('heading', { level: 1, name: /run in your browser/i })).toBeInTheDocument();
    expect(screen.getAllByText(/URO/).length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument();
    expect(await screen.findByText(/Site statistics/i)).toBeInTheDocument();
  });

  it('shows the login page', async () => {
    renderAt('/login');
    expect(await screen.findByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
  });

  it('redirects /profile to login when logged out', async () => {
    renderAt('/profile');
    expect(await screen.findByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
  });

  it('redirects /admin to login when logged out', async () => {
    renderAt('/admin');
    expect(await screen.findByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
  });

  it('shows the contact form and the 404 page', async () => {
    renderAt('/contact');
    expect(await screen.findByRole('button', { name: /send message/i })).toBeInTheDocument();
    renderAt('/does-not-exist');
    expect(await screen.findByRole('heading', { name: /page not found/i })).toBeInTheDocument();
  });

  it('renders the flood model page for guests with a login hint', async () => {
    renderAt('/models/flood-model');
    expect(await screen.findByRole('heading', { level: 1, name: /flood model/i })).toBeInTheDocument();
    expect(screen.getByText(/log in to run the model/i)).toBeInTheDocument();
  });
});
