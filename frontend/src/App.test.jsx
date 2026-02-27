import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';

// Mock the external deps
vi.mock('@stellar/freighter-api', () => ({
    isConnected: vi.fn().mockResolvedValue(true),
    requestAccess: vi.fn(),
    signTransaction: vi.fn()
}));

vi.mock('./contract', () => ({
    server: {
        getAccount: vi.fn(),
        simulateTransaction: vi.fn(),
        transactions: vi.fn().mockReturnValue({
            forAccount: vi.fn().mockReturnValue({
                limit: vi.fn().mockReturnValue({
                    order: vi.fn().mockReturnValue({
                        call: vi.fn().mockResolvedValue({ records: [] })
                    })
                })
            })
        })
    },
    contract: {
        call: vi.fn()
    },
    TransactionBuilder: class {
        constructor() { }
        addOperation() { return this; }
        setTimeout() { return this; }
        build() { return {}; }
    },
    Networks: { TESTNET: 'Test SDF Network ; September 2015' }
}));

describe('App Component', () => {
    it('renders main heading', () => {
        render(<App />);
        expect(screen.getByText('Empower Global Change with Stellar.')).toBeInTheDocument();
    });

    it('renders campaign cards', () => {
        render(<App />);
        expect(screen.getByText('Project Ocean Cleanup')).toBeInTheDocument();
        expect(screen.getByText('Global Reforestation')).toBeInTheDocument();
        expect(screen.getByText('Rural Education Tech')).toBeInTheDocument();
    });

    it('filters campaigns on search', async () => {
        render(<App />);
        const searchInput = screen.getByPlaceholderText(/Search for causes/i);
        fireEvent.change(searchInput, { target: { value: 'Ocean' } });

        expect(screen.getByText('Project Ocean Cleanup')).toBeInTheDocument();
        expect(screen.queryByText('Global Reforestation')).not.toBeInTheDocument();
    });
});
