import { FastifyRequest, FastifyReply } from 'fastify';
import { ExpensesService } from './expenses.service';
import {
    createExpenseSchema,
    updateExpenseSchema,
    expenseFiltersSchema,
    addCommentSchema,
} from './expenses.schemas';

export class ExpensesController {
    private expensesService: ExpensesService;

    constructor() {
        this.expensesService = new ExpensesService();
    }

    /**
     * Create new expense
     */
    async createExpense(request: FastifyRequest, reply: FastifyReply) {
        try {
            const decoded = await request.jwtVerify<{ userId: string }>();
            const dto = createExpenseSchema.parse(request.body);

            const expense = await this.expensesService.createExpense(decoded.userId, dto);

            // Fetch full expense with relations
            const fullExpense = await this.expensesService.getExpenseById(
                expense.id,
                decoded.userId
            );

            return reply.status(201).send({ expense: fullExpense });
        } catch (error: any) {
            return reply.status(400).send({
                error: {
                    message: error.message || 'Failed to create expense',
                    statusCode: 400,
                },
            });
        }
    }

    /**
     * Get expenses with filters
     */
    async getExpenses(request: FastifyRequest, reply: FastifyReply) {
        try {
            const decoded = await request.jwtVerify<{ userId: string }>();
            const filters = expenseFiltersSchema.parse(request.query);

            const result = await this.expensesService.getExpenses(decoded.userId, filters);

            return reply.send(result);
        } catch (error: any) {
            return reply.status(400).send({
                error: {
                    message: error.message || 'Failed to get expenses',
                    statusCode: 400,
                },
            });
        }
    }

    /**
     * Get expense by ID
     */
    async getExpense(request: FastifyRequest, reply: FastifyReply) {
        try {
            const decoded = await request.jwtVerify<{ userId: string }>();
            const { expenseId } = request.params as { expenseId: string };

            const expense = await this.expensesService.getExpenseById(
                expenseId,
                decoded.userId
            );

            return reply.send({ expense });
        } catch (error: any) {
            return reply.status(404).send({
                error: {
                    message: error.message || 'Expense not found',
                    statusCode: 404,
                },
            });
        }
    }

    /**
     * Update expense
     */
    async updateExpense(request: FastifyRequest, reply: FastifyReply) {
        try {
            const decoded = await request.jwtVerify<{ userId: string }>();
            const { expenseId } = request.params as { expenseId: string };
            const dto = updateExpenseSchema.parse(request.body);

            const expense = await this.expensesService.updateExpense(
                expenseId,
                decoded.userId,
                dto
            );

            // Fetch updated expense with relations
            const fullExpense = await this.expensesService.getExpenseById(
                expense.id,
                decoded.userId
            );

            return reply.send({ expense: fullExpense });
        } catch (error: any) {
            return reply.status(400).send({
                error: {
                    message: error.message || 'Failed to update expense',
                    statusCode: 400,
                },
            });
        }
    }

    /**
     * Delete expense
     */
    async deleteExpense(request: FastifyRequest, reply: FastifyReply) {
        try {
            const decoded = await request.jwtVerify<{ userId: string }>();
            const { expenseId } = request.params as { expenseId: string };

            await this.expensesService.deleteExpense(expenseId, decoded.userId);

            return reply.send({ message: 'Expense deleted successfully' });
        } catch (error: any) {
            return reply.status(400).send({
                error: {
                    message: error.message || 'Failed to delete expense',
                    statusCode: 400,
                },
            });
        }
    }

    /**
     * Add comment to expense
     */
    async addComment(request: FastifyRequest, reply: FastifyReply) {
        try {
            const decoded = await request.jwtVerify<{ userId: string }>();
            const { expenseId } = request.params as { expenseId: string };
            const dto = addCommentSchema.parse(request.body);

            const comment = await this.expensesService.addComment(
                expenseId,
                decoded.userId,
                dto.comment
            );

            return reply.status(201).send({ comment });
        } catch (error: any) {
            return reply.status(400).send({
                error: {
                    message: error.message || 'Failed to add comment',
                    statusCode: 400,
                },
            });
        }
    }
}
