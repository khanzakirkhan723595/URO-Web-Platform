import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// vi.mock is hoisted above normal code, so shared values must be created with vi.hoisted
const { adminUser } = vi.hoisted(() => ({
  adminUser: { _id: 'u1', name: 'Asha Rao', email: 'asha@example.com', role: 'admin', organization: 'IIT Palakkad' },
}));

// Backend faked: an administrator is logged in and every API returns small sample data.
vi.mock('./services/api', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    default: { get: vi.fn().mockResolvedValue({ data: { status: 'success', data: { user: adminUser } } }), post: vi.fn(), request: vi.fn() },
    recordPageVisit: vi.fn().mockResolvedValue(null),
    getVisitorStats: vi.fn().mockResolvedValue({ status: 'success', data: { totalPageHits: 1, totalUniqueVisitors: 1 } }),
    getAiStatus: vi.fn().mockResolvedValue(true),
    getMySummary: vi.fn().mockResolvedValue({ data: { savedRuns: 2, feedbackCount: 1, lastRun: null, memberSince: '2026-01-01', lastLogin: '2026-02-01' } }),
    getAdminDashboardStats: vi.fn().mockResolvedValue({ data: { totalPageHits: 120, totalUniqueIPs: 30, totalRegisteredUsers: 5, totalFeedbackItems: 2, newFeedbackItems: 1, newMessages: 1 } }),
    getAllFeedbackAdmin: vi.fn().mockResolvedValue({ data: { feedbacks: [{ _id: 'f1', user: { name: 'Ravi', email: 'r@x.com' }, modelName: 'FloodModel', rating: 4, comment: 'Great tool', status: 'new', createdAt: '2026-01-02' }] } }),
    getAllUsersAdmin: vi.fn().mockResolvedValue({ data: { users: [adminUser, { _id: 'u2', name: 'Ravi', email: 'r@x.com', role: 'user', createdAt: '2026-01-02' }] } }),
    getContactMessagesAdmin: vi.fn().mockResolvedValue({ data: { messages: [{ _id: 'm1', name: 'Mira', email: 'm@x.com', message: 'Hello lab', status: 'new', createdAt: '2026-01-03' }] } }),
    runModel: vi.fn().mockResolvedValue({ success: true, pltData: 'VARIABLES = "X", "Y", "HMAX"\nZONE N= 3\n0 0 0.0\n1 0 0.8\n2 0 2.4\n' }),
    getSimulationHistory: vi.fn().mockResolvedValue({ status: 'success', data: { history: [] } }),
    getFeedbackForModel: vi.fn().mockResolvedValue({ status: 'success', data: { feedbacks: [] } }),
    getCurrentUserFeedbackForModel: vi.fn().mockResolvedValue({ data: { feedback: null } }),
  };
});

import App from './App';
import ResultInsights from './components/ResultInsights';
import { AuthProvider } from './context/AuthContext';
import { MemoryRouter } from 'react-router-dom';
import { parsePltData } from './utils/plt';

const renderAt = (path) => { window.history.pushState({}, '', path); return render(<App />); };

describe('logged-in admin', () => {
  it('shows the profile page with account details and tabs', async () => {
    renderAt('/profile');
    expect(await screen.findByRole('heading', { level: 1, name: /my profile/i })).toBeInTheDocument();
    expect(screen.getAllByText('asha@example.com').length).toBeGreaterThan(0);
    expect(await screen.findByText('Saved runs')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('tab', { name: /security/i }));
    expect(screen.getByRole('heading', { name: /change password/i })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('tab', { name: /edit profile/i }));
    expect(screen.getByLabelText(/full name/i)).toHaveValue('Asha Rao');
  });

  it('shows the admin panel tabs with data', async () => {
    renderAt('/admin');
    expect(await screen.findByRole('heading', { level: 1, name: /admin panel/i })).toBeInTheDocument();
    expect(await screen.findByText('Total page views')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('tab', { name: /feedback/i }));
    expect(await screen.findByText('Great tool')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ai summary/i })).toBeInTheDocument(); // AI is enabled in this mock
    await userEvent.click(screen.getByRole('tab', { name: /users/i }));
    const table = await screen.findByRole('table');
    expect(within(table).getByText('Ravi')).toBeInTheDocument();
    expect(within(table).getByText('You')).toBeInTheDocument(); // an admin cannot change their own role
    await userEvent.click(screen.getByRole('tab', { name: /messages/i }));
    expect(await screen.findByText('Hello lab')).toBeInTheDocument();
  });

  it('shows the assistant page', async () => {
    renderAt('/assistant');
    expect(await screen.findByRole('heading', { level: 1, name: /flood lab assistant/i })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /what does hmax mean/i })).toBeEnabled();
  });
});

describe('flood model run (main feature)', () => {
  it('uploads a hydrograph, runs the model and shows the result summary', async () => {
    renderAt('/models/flood-model');
    const input = await screen.findByLabelText(/hydrograph file/i);
    const run = screen.getByRole('button', { name: /run flood model/i });
    expect(run).toBeDisabled(); // nothing uploaded yet

    await userEvent.upload(input, new File(['0 10\n60 20\n'], 'Hydrograph.txt', { type: 'text/plain' }));
    expect(await screen.findAllByText('Hydrograph.txt')).not.toHaveLength(0);
    expect(run).toBeEnabled();

    await userEvent.click(run);
    expect(await screen.findByRole('heading', { name: /result summary/i })).toBeInTheDocument();
    expect(screen.getByText('2.4 m')).toBeInTheDocument();
    expect(screen.getByText(/Peak depth: Severe/)).toBeInTheDocument();
  });

  it('rejects non-.txt files with a clear message', async () => {
    renderAt('/models/flood-model');
    const input = await screen.findByLabelText(/hydrograph file/i);
    await userEvent.upload(input, new File(['x'], 'data.csv', { type: 'text/csv' }), { applyAccept: false });
    expect(await screen.findByText(/only \.txt files are allowed/i)).toBeInTheDocument();
  });
});

describe('ResultInsights', () => {
  const plt = 'VARIABLES = "X", "Y", "HMAX"\nZONE N= 3\n0 0 0.0\n1 0 0.8\n2 0 2.4\n';

  it('shows summary numbers and the AI button for logged-in users', async () => {
    render(
      <MemoryRouter><AuthProvider><ResultInsights parsed={parsePltData(plt)} modelName="FloodModel" executionTime={60} /></AuthProvider></MemoryRouter>
    );
    expect(await screen.findByText('2.4 m')).toBeInTheDocument(); // max depth
    expect(screen.getByText(/Peak depth: Severe/)).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /explain my results/i })).toBeInTheDocument();
  });
});
