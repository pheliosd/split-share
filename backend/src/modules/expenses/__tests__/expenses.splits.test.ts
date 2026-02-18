import { Decimal } from 'decimal.js';

// Pure split calculation logic extracted for testing
// (mirrors the logic in expenses.service.ts)

type SplitType = 'equal' | 'exact' | 'percentage' | 'shares';

interface SplitInput {
    userId: string;
    value?: number; // amount for exact, percentage for %, shares for shares
}

interface SplitResult {
    userId: string;
    amount: Decimal;
}

function calculateSplits(
    total: number,
    splitType: SplitType,
    members: SplitInput[]
): SplitResult[] {
    const totalDecimal = new Decimal(total);

    if (splitType === 'equal') {
        const share = totalDecimal.dividedBy(members.length).toDecimalPlaces(2);
        return members.map((m) => ({ userId: m.userId, amount: share }));
    }

    if (splitType === 'exact') {
        return members.map((m) => ({
            userId: m.userId,
            amount: new Decimal(m.value ?? 0),
        }));
    }

    if (splitType === 'percentage') {
        return members.map((m) => ({
            userId: m.userId,
            amount: totalDecimal.times(m.value ?? 0).dividedBy(100).toDecimalPlaces(2),
        }));
    }

    if (splitType === 'shares') {
        const totalShares = members.reduce((sum, m) => sum + (m.value ?? 1), 0);
        return members.map((m) => ({
            userId: m.userId,
            amount: totalDecimal
                .times(m.value ?? 1)
                .dividedBy(totalShares)
                .toDecimalPlaces(2),
        }));
    }

    throw new Error(`Unknown split type: ${splitType}`);
}

describe('Expense Split Calculations', () => {
    const members = [
        { userId: 'user1' },
        { userId: 'user2' },
        { userId: 'user3' },
    ];

    describe('equal split', () => {
        it('should split equally among 3 members', () => {
            const result = calculateSplits(90, 'equal', members);
            expect(result).toHaveLength(3);
            result.forEach((r) => {
                expect(r.amount.toNumber()).toBe(30);
            });
        });

        it('should handle non-divisible amounts', () => {
            const result = calculateSplits(100, 'equal', members);
            // 100 / 3 = 33.33 each
            result.forEach((r) => {
                expect(r.amount.toNumber()).toBeCloseTo(33.33, 2);
            });
        });

        it('should split between 2 members', () => {
            const result = calculateSplits(50, 'equal', [
                { userId: 'a' },
                { userId: 'b' },
            ]);
            result.forEach((r) => expect(r.amount.toNumber()).toBe(25));
        });
    });

    describe('exact split', () => {
        it('should use provided exact amounts', () => {
            const result = calculateSplits(100, 'exact', [
                { userId: 'user1', value: 60 },
                { userId: 'user2', value: 40 },
            ]);
            expect(result[0].amount.toNumber()).toBe(60);
            expect(result[1].amount.toNumber()).toBe(40);
        });
    });

    describe('percentage split', () => {
        it('should calculate correct percentages', () => {
            const result = calculateSplits(200, 'percentage', [
                { userId: 'user1', value: 50 },
                { userId: 'user2', value: 30 },
                { userId: 'user3', value: 20 },
            ]);
            expect(result[0].amount.toNumber()).toBe(100);
            expect(result[1].amount.toNumber()).toBe(60);
            expect(result[2].amount.toNumber()).toBe(40);
        });
    });

    describe('shares split', () => {
        it('should split by share ratio', () => {
            const result = calculateSplits(120, 'shares', [
                { userId: 'user1', value: 2 },
                { userId: 'user2', value: 1 },
            ]);
            // 2:1 ratio → 80 and 40
            expect(result[0].amount.toNumber()).toBe(80);
            expect(result[1].amount.toNumber()).toBe(40);
        });

        it('should handle equal shares (1:1:1)', () => {
            const result = calculateSplits(90, 'shares', [
                { userId: 'user1', value: 1 },
                { userId: 'user2', value: 1 },
                { userId: 'user3', value: 1 },
            ]);
            result.forEach((r) => expect(r.amount.toNumber()).toBe(30));
        });
    });

    describe('invalid split type', () => {
        it('should throw for unknown split type', () => {
            expect(() =>
                calculateSplits(100, 'unknown' as SplitType, members)
            ).toThrow('Unknown split type');
        });
    });
});
