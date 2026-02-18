import axios from 'axios';

// Simple in-memory cache for exchange rates (TTL: 1 hour)
const rateCache: Map<string, { rates: Record<string, number>; expiresAt: number }> = new Map();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export const SUPPORTED_CURRENCIES = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
    { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
];

export class CurrencyService {
    private readonly apiUrl = 'https://api.exchangerate-api.com/v4/latest';

    async getRates(baseCurrency = 'USD'): Promise<Record<string, number>> {
        const cacheKey = baseCurrency;
        const cached = rateCache.get(cacheKey);

        if (cached && cached.expiresAt > Date.now()) {
            return cached.rates;
        }

        try {
            const response = await axios.get(`${this.apiUrl}/${baseCurrency}`, {
                timeout: 5000,
            });
            const rates: Record<string, number> = response.data.rates;

            rateCache.set(cacheKey, {
                rates,
                expiresAt: Date.now() + CACHE_TTL_MS,
            });

            return rates;
        } catch {
            // Fallback static rates if API unavailable
            return this.getFallbackRates(baseCurrency);
        }
    }

    async convertAmount(
        amount: number,
        fromCurrency: string,
        toCurrency: string
    ): Promise<number> {
        if (fromCurrency === toCurrency) return amount;

        const rates = await this.getRates(fromCurrency);
        const rate = rates[toCurrency];

        if (!rate) throw new Error(`Unsupported currency: ${toCurrency}`);

        return Math.round(amount * rate * 100) / 100;
    }

    getSupportedCurrencies() {
        return SUPPORTED_CURRENCIES;
    }

    private getFallbackRates(base: string): Record<string, number> {
        // Approximate rates relative to USD (updated periodically)
        const usdRates: Record<string, number> = {
            USD: 1, EUR: 0.92, GBP: 0.79, INR: 83.1,
            JPY: 149.5, CAD: 1.36, AUD: 1.53, CHF: 0.88,
            CNY: 7.24, SGD: 1.34,
        };

        if (base === 'USD') return usdRates;

        const baseRate = usdRates[base] || 1;
        const result: Record<string, number> = {};
        for (const [code, rate] of Object.entries(usdRates)) {
            result[code] = Math.round((rate / baseRate) * 10000) / 10000;
        }
        return result;
    }
}
