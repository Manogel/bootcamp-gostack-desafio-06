import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CategoriesRepository from '../repositories/CategoriesRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute(data: Request): Promise<Transaction> {
    const { title, value, type, category: titleCategory } = data;

    const transactionRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getCustomRepository(CategoriesRepository);

    const balance = await transactionRepository.getBalance();

    if (type === 'outcome' && value > balance.total) {
      throw new AppError(
        'You do not have enough balance for this transaction',
        401,
      );
    }

    const category = await categoriesRepository.findOrCreate(titleCategory);
    await categoriesRepository.save(category);

    delete category.created_at;
    delete category.updated_at;

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category_id: category.id,
    });

    await transactionRepository.save(transaction);

    transaction.category = category;

    delete transaction.created_at;
    delete transaction.updated_at;
    delete transaction.category_id;

    return transaction;
  }
}

export default CreateTransactionService;
