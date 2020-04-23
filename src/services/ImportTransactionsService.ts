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

async function csvJSON(csvPath: string): Promise<CreateManyTransactionsDTO[]> {
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

    /*  for (let j = 0; j < headers.length; j++) {
      const indexName: string = headers[j].trim();
      const valueIndex: string = currentline[j].trim();
      transaction.title = valueIndex;
    }
 */
    const transaction: CreateManyTransactionsDTO = Object.assign(
      {},
      ...headers.map((k, i) => ({ [k]: currentline[i].trim() })),
    );

    result.push(transaction);
  }

  return result;
}

class ImportTransactionsService {
  async execute(data: Request): Promise<Transaction[]> {
    const { path } = data;

    const transactionRepository = getCustomRepository(TransactionsRepository);

    const arrayJsonTransactions: CreateManyTransactionsDTO[] = await csvJSON(
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
}

export default ImportTransactionsService;
