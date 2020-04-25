import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute(data: Request): Promise<Transaction> {
    const { title, value, type, category } = data;

    const transactionRepository = getCustomRepository(TransactionsRepository);

    const balance = await transactionRepository.getBalance();

    if (type === 'outcome' && value > balance.total) {
      throw new AppError(
        'You do not have enough balance for this transaction',
        400,
      );
    }

    const transaction = await transactionRepository.createWithCagetory({
      title,
      value,
      type,
      category,
    });

    return transaction;
  }
}

export default CreateTransactionService;
