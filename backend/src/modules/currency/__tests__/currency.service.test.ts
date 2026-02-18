import { CurrencyService } from '../currency.service';

// Mock axios to avoid real HTTP calls in tests
jest.mock('axios', () => ({
    get: jest.fn(),
}));

import axios from 'axios';
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('CurrencyService', () => {
    let service: CurrencyService;

    beforeEach(() => {
        service = new CurrencyService();
        jest.clearAllMocks();
    });

    describe('getSupportedCurrencies', () => {
        it('should return 10 supported currencies', () => {
            const currencies = service.getSupportedCurrencies();
            expect(currencies).toHaveLength(10);
            expect(currencies.map((c) => c.code)).toContain('USD');
            expect(currencies.map((c) => c.code)).toContain('EUR');
            expect(currencies.map((c) => c.code)).toContain('INR');
        });

        it('each currency should have code, symbol, and name', () => {
            const currencies = service.getSupportedCurrencies();
            currencies.forEach((c) => {
                expect(c.code).toBeTruthy();
                expect(c.symbol).toBeTruthy();
                expect(c.name).toBeTruthy();
            });
        });
    });

    describe('getRates', () => {
        it('should return rates from API on success', async () => {
            const mockRates = { EUR: 0.92, GBP: 0.79, INR: 83.1 };
            mockedAxios.get.mockResolvedValueOnce({ data: { rates: mockRates } });

            const rates = await service.getRates('USD');
            expect(rates).toEqual(mockRates);
            expect(mockedAxios.get).toHaveBeenCalledWith(
                expect.stringContaining('USD'),
                expect.any(Object)
            );
        });

        it('should return fallback rates when API fails', async () => {
            mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

            const rates = await service.getRates('USD');
            expect(rates).toBeDefined();
            expect(rates['EUR']).toBeGreaterThan(0);
            expect(rates['USD']).toBe(1);
        });

        it('should use cache on second call', async () => {
            const mockRates = { EUR: 0.92 };
            mockedAxios.get.mockResolvedValue({ data: { rates: mockRates } });

            await service.getRates('USD');
            await service.getRates('USD');

            // Should only call API once due to caching
            expect(mockedAxios.get).toHaveBeenCalledTimes(1);
        });
    });

    describe('convertAmount', () => {
        it('should return same amount when currencies match', async () => {
            const result = await service.convertAmount(100, 'USD', 'USD');
            expect(result).toBe(100);
        });

        it('should convert USD to EUR correctly', async () => {
            mockedAxios.get.mockResolvedValueOnce({
                data: { rates: { EUR: 0.92, GBP: 0.79 } },
            });

            const result = await service.convertAmount(100, 'USD', 'EUR');
            expect(result).toBe(92);
        });

        it('should throw for unsupported target currency', async () => {
            mockedAxios.get.mockResolvedValueOnce({
                data: { rates: { EUR: 0.92 } },
            });

            await expect(
                service.convertAmount(100, 'USD', 'XYZ')
            ).rejects.toThrow('Unsupported currency: XYZ');
        });
    });
});
