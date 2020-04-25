import fs from 'fs';
import csvparse from 'csv-parse';
import { getCustomRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  path: string;
  filename: string;
}

interface CreateManyTransactionsDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class ImportTransactionsService {
  async execute(data: Request): Promise<Transaction[]> {
    const { path } = data;

    const transactionRepository = getCustomRepository(TransactionsRepository);

    const arrayJsonTransactions: CreateManyTransactionsDTO[] = await this.convertCSVtoJSON(
      path,
    );

    const transactions: Transaction[] = [] as Transaction[];

    for (let i = 0; i < arrayJsonTransactions.length; i++) {
      const transaction = await transactionRepository.createWithCagetory(
        arrayJsonTransactions[i],
      );
      transactions.push(transaction);
    }

    return transactions;
  }

  async convertCSVtoJSON(
    csvPath: string,
  ): Promise<CreateManyTransactionsDTO[]> {
    const csv = await new Promise<Array<string[]>>(resolve => {
      const listLineCsv: Array<string[]> = [];
      fs.createReadStream(csvPath)
        .pipe(csvparse())
        .on('data', row => {
          listLineCsv.push(row);
        })
        .on('end', () => {
          resolve(listLineCsv);
        });
    });

    const result: CreateManyTransactionsDTO[] = [];

    const headers: string[] = csv[0].map(t => t.trim());

    for (let i = 1; i < csv.length; i++) {
      const currentline = csv[i];

      const transaction: CreateManyTransactionsDTO = Object.assign(
        {},
        ...headers.map((k, idx) => ({ [k]: currentline[idx].trim() })),
      );

      result.push(transaction);
    }

    return result;
  }
}

export default ImportTransactionsService;
