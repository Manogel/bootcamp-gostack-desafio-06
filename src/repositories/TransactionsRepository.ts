import { EntityRepository, Repository, getCustomRepository } from 'typeorm';

import CategoriesRepository from './CategoriesRepository';
import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

interface CreateManyTransactionsDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

interface CreateWithCaterogyDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    const balance = transactions.reduce(
      (lastBalance, transaction) => {
        const { type, value } = transaction;
        if (type === 'income') {
          return {
            ...lastBalance,
            income: lastBalance.income + value,
          };
        }
        return {
          ...lastBalance,
          outcome: lastBalance.outcome + value,
        };
      },
      {
        income: 0,
        outcome: 0,
        total: 0,
      },
    );

    return {
      ...balance,
      total: balance.income - balance.outcome,
    };
  }

  public async createWithCagetory(
    data: CreateWithCaterogyDTO,
  ): Promise<Transaction> {
    const { category, title, type, value } = data;

    const categoriesRepository = getCustomRepository(CategoriesRepository);

    const createdCategory = await categoriesRepository.findOrCreate(category);

    const transaction = this.create({
      title,
      value,
      type,
      category_id: createdCategory.id,
    });

    await this.save(transaction);

    transaction.category = createdCategory;

    return transaction;
  }
}

export default TransactionsRepository;
