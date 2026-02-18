import { baseApi } from './baseApi';

interface Currency {
    code: string;
    symbol: string;
    name: string;
}

interface ConvertResult {
    original: { amount: number; currency: string };
    converted: { amount: number; currency: string };
}

export const currencyApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getSupportedCurrencies: builder.query<{ currencies: Currency[] }, void>({
            query: () => '/currencies/supported',
        }),

        getExchangeRates: builder.query<{ base: string; rates: Record<string, number> }, string>({
            query: (base) => ({ url: '/currencies/rates', params: { base } }),
        }),

        convertCurrency: builder.query<
            ConvertResult,
            { amount: number; from: string; to: string }
        >({
            query: ({ amount, from, to }) => ({
                url: '/currencies/convert',
                params: { amount, from, to },
            }),
        }),
    }),
});

export const {
    useGetSupportedCurrenciesQuery,
    useGetExchangeRatesQuery,
    useConvertCurrencyQuery,
} = currencyApi;
