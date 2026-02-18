import Decimal from 'decimal.js';

// Configure Decimal.js for financial precision
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

/**
 * Money calculator with precise decimal arithmetic
 * Prevents floating-point errors in financial calculations
 */
export class MoneyCalculator {
    /**
     * Add two numbers with precision
     */
    static add(a: number, b: number): number {
        return new Decimal(a).plus(b).toNumber();
    }

    /**
     * Subtract two numbers with precision
     */
    static subtract(a: number, b: number): number {
        return new Decimal(a).minus(b).toNumber();
    }

    /**
     * Multiply two numbers with precision
     */
    static multiply(a: number, b: number): number {
        return new Decimal(a).times(b).toNumber();
    }

    /**
     * Divide two numbers with precision
     */
    static divide(a: number, b: number): number {
        if (b === 0) throw new Error('Division by zero');
        return new Decimal(a).dividedBy(b).toNumber();
    }

    /**
     * Round a number to specified decimal places
     */
    static round(value: number, decimals: number = 2): number {
        return new Decimal(value).toDecimalPlaces(decimals).toNumber();
    }

    /**
     * Split an amount equally among N parts
     * Distributes remainder cents to first N people
     * 
     * Example: split(100, 3) => [33.34, 33.33, 33.33]
     */
    static split(total: number, parts: number): number[] {
        if (parts === 0) throw new Error('Cannot split into zero parts');

        const perPart = new Decimal(total).dividedBy(parts);
        const rounded = perPart.toDecimalPlaces(2, Decimal.ROUND_DOWN);
        const remainder = new Decimal(total).minus(rounded.times(parts));

        const results: number[] = Array(parts).fill(rounded.toNumber());

        // Distribute remainder cents to first N people
        const remainderCents = remainder.times(100).toNumber();
        for (let i = 0; i < remainderCents; i++) {
            results[i] = new Decimal(results[i]).plus(0.01).toNumber();
        }

        return results;
    }

    /**
     * Split amount by percentages
     * Ensures total equals exactly the input amount
     */
    static splitByPercentage(
        total: number,
        percentages: number[]
    ): number[] {
        const sum = percentages.reduce((acc, p) => acc + p, 0);
        if (Math.abs(sum - 100) > 0.01) {
            throw new Error('Percentages must sum to 100');
        }

        const results: number[] = [];
        let allocated = new Decimal(0);

        for (let i = 0; i < percentages.length; i++) {
            const percentage = percentages[i];
            const amount = new Decimal(total).times(percentage).dividedBy(100);

            if (i === percentages.length - 1) {
                // Last person gets the remainder to ensure exact total
                results.push(new Decimal(total).minus(allocated).toNumber());
            } else {
                const rounded = amount.toDecimalPlaces(2);
                results.push(rounded.toNumber());
                allocated = allocated.plus(rounded);
            }
        }

        return results;
    }

    /**
     * Split amount by shares
     * Example: total=100, shares=[1,2,3] => [16.67, 33.33, 50.00]
     */
    static splitByShares(total: number, shares: number[]): number[] {
        const totalShares = shares.reduce((acc, s) => acc + s, 0);
        if (totalShares === 0) throw new Error('Total shares cannot be zero');

        const results: number[] = [];
        let allocated = new Decimal(0);

        for (let i = 0; i < shares.length; i++) {
            const share = shares[i];

            if (i === shares.length - 1) {
                // Last person gets the remainder
                results.push(new Decimal(total).minus(allocated).toNumber());
            } else {
                const amount = new Decimal(total).times(share).dividedBy(totalShares);
                const rounded = amount.toDecimalPlaces(2);
                results.push(rounded.toNumber());
                allocated = allocated.plus(rounded);
            }
        }

        return results;
    }

    /**
     * Compare two amounts for equality with precision tolerance
     */
    static equals(a: number, b: number, tolerance: number = 0.01): boolean {
        return Math.abs(a - b) < tolerance;
    }

    /**
     * Check if amount is positive
     */
    static isPositive(amount: number): boolean {
        return new Decimal(amount).isPositive();
    }

    /**
     * Check if amount is negative
     */
    static isNegative(amount: number): boolean {
        return new Decimal(amount).isNegative();
    }

    /**
     * Check if amount is zero (within tolerance)
     */
    static isZero(amount: number, tolerance: number = 0.01): boolean {
        return Math.abs(amount) < tolerance;
    }
}
