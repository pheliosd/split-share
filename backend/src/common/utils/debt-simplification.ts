import { MoneyCalculator } from '../utils/money-calculator';

export interface Balance {
    userId: string;
    amount: number; // positive = owed to user, negative = user owes
}

export interface SimplifiedDebt {
    from: string; // userId who pays
    to: string;   // userId who receives
    amount: number;
}

/**
 * Debt simplification using greedy algorithm
 * Minimizes the number of transactions needed to settle all debts
 * 
 * Time Complexity: O(n log n) due to sorting
 * Space Complexity: O(n)
 */
export function simplifyDebts(balances: Balance[]): SimplifiedDebt[] {
    // Filter out zero balances
    const nonZeroBalances = balances.filter(
        b => !MoneyCalculator.isZero(b.amount)
    );

    if (nonZeroBalances.length === 0) {
        return [];
    }

    // Separate creditors (positive balance) and debtors (negative balance)
    const creditors = nonZeroBalances
        .filter(b => MoneyCalculator.isPositive(b.amount))
        .sort((a, b) => b.amount - a.amount) // Descending
        .map(b => ({ userId: b.userId, amount: b.amount }));

    const debtors = nonZeroBalances
        .filter(b => MoneyCalculator.isNegative(b.amount))
        .sort((a, b) => a.amount - b.amount) // Ascending (most negative first)
        .map(b => ({ userId: b.userId, amount: Math.abs(b.amount) }));

    const result: SimplifiedDebt[] = [];

    let i = 0; // creditor index
    let j = 0; // debtor index

    while (i < creditors.length && j < debtors.length) {
        const creditor = creditors[i];
        const debtor = debtors[j];

        const settlementAmount = Math.min(creditor.amount, debtor.amount);

        result.push({
            from: debtor.userId,
            to: creditor.userId,
            amount: MoneyCalculator.round(settlementAmount, 2)
        });

        creditor.amount = MoneyCalculator.subtract(creditor.amount, settlementAmount);
        debtor.amount = MoneyCalculator.subtract(debtor.amount, settlementAmount);

        if (MoneyCalculator.isZero(creditor.amount)) i++;
        if (MoneyCalculator.isZero(debtor.amount)) j++;
    }

    return result;
}

/**
 * Generate human-readable explanation of simplification
 */
export function explainSimplification(
    original: SimplifiedDebt[],
    simplified: SimplifiedDebt[]
): string {
    const saved = original.length - simplified.length;

    if (saved === 0) {
        return 'No simplification possible. All transactions are already optimal.';
    }

    return `Simplified from ${original.length} to ${simplified.length} transactions, saving ${saved} transaction${saved > 1 ? 's' : ''}.`;
}

/**
 * Calculate non-simplified debts (direct debts between all pairs)
 */
export function calculateDirectDebts(
    expenses: Array<{
        payerId: string;
        splits: Array<{ userId: string; owedAmount: number }>;
    }>
): SimplifiedDebt[] {
    const debts = new Map<string, number>(); // key: "fromUserId-toUserId"

    for (const expense of expenses) {
        for (const split of expense.splits) {
            if (split.userId === expense.payerId) continue;

            const key = `${split.userId}-${expense.payerId}`;
            const current = debts.get(key) || 0;
            debts.set(key, MoneyCalculator.add(current, split.owedAmount));
        }
    }

    const result: SimplifiedDebt[] = [];

    for (const [key, amount] of debts.entries()) {
        if (MoneyCalculator.isZero(amount)) continue;

        const [from, to] = key.split('-');
        result.push({ from, to, amount: MoneyCalculator.round(amount, 2) });
    }

    return result;
}
