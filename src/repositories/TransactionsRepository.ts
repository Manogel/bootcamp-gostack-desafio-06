import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
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
}

export default TransactionsRepository;
