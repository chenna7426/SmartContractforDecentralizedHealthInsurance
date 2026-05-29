import { render, screen, waitFor } from '@testing-library/react';
import App from './App';
import API from './api/Api';

jest.mock('./api/Api', () => ({
  __esModule: true,
  default: {
    defaults: {
      headers: {
        common: {},
      },
    },
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
  },
}));

jest.mock('./services/blockchainService', () => ({
  approveClaimOnChain: jest.fn(),
  connectWallet: jest.fn(),
  getInsuranceBalance: jest.fn().mockResolvedValue('0'),
  rejectClaimOnChain: jest.fn(),
  submitClaimOnChain: jest.fn(),
  switchToHardhatNetwork: jest.fn(),
  getOnChainClaimStatus: jest.fn(),
  getAdminWallet: jest.fn(),
}));

beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
  API.get.mockImplementation((url) => Promise.resolve({ data: { claims: [] } }));
});

test('renders the decentralized insurance workflow UI', async () => {
  render(<App />);

  await waitFor(() => {
    expect(screen.getByText(/Decentralized Health Insurance/i)).toBeInTheDocument();
  });

  expect(screen.getByText(/Connect MetaMask/i)).toBeInTheDocument();
});

test('loads admin claims only once when visiting the manage claims page', async () => {
  localStorage.setItem(
    'dhi_session',
    JSON.stringify({
      user: { id: 1, role: 'Admin', username: 'admin' },
      token: 'admin-token',
    })
  );

  window.history.pushState({}, '', '/manage-claims');

  render(<App />);

  await waitFor(() => {
    expect(screen.getByText(/Manage Claims/i)).toBeInTheDocument();
  });

  await waitFor(() => {
    expect(API.get).toHaveBeenCalledWith('/api/admin/claims');
  });

  expect(
    API.get.mock.calls.filter(([url]) => url === '/api/admin/claims')
  ).toHaveLength(1);
});
