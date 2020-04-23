import { getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    const transactionRepository = getRepository(Transaction);

    const transationIsExists = await transactionRepository.findOne(id);

    if (!transationIsExists) {
      throw new AppError('Transation is not exists!', 404);
    }

    transactionRepository.delete(transationIsExists);
  }
}

export default DeleteTransactionService;
