import csvParse from 'csv-parse';
import fs from 'fs';

import { getCustomRepository, getRepository, In } from 'typeorm';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

import TransactionRepository from '../repositories/TransactionsRepository';

interface CSVTransaction {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(filePath: string): Promise<Transaction[]> {
    const transactionRepository = getCustomRepository(TransactionRepository);
    const categoriesRepository = getRepository(Category);

    // Stream que vai ler os nossos arquivos
    const contactsReadStream = fs.createReadStream(filePath);

    // Passando algumas configurações do CSV
    const parsers = csvParse({
      delimiter: ',',
      from_line: 2, // Começando a ler na linha 2, não pegar o header
    });

    // Lendo as linhas conforme elas ficarem disponíveis
    const parseCSV = contactsReadStream.pipe(parsers);

    const transactions: CSVTransaction[] = [];
    const categories: string[] = [];

    // Não consigo usar await nesse caso por que parseCSV.on não é uma promise
    parseCSV.on('data', async line => {
      const [title, type, value, category] = line.map((cell: string) =>
        cell.trim(),
      );

      if (!title || !type || !value) return;

      categories.push(category);

      transactions.push({ title, type, value, category });
    });

    /**
     * Verifica se o ParseCSV que não é assincrono está disparando um evento end
     * Se ainda não estiver acabado, ele continua esperando
     */
    await new Promise(resolve => parseCSV.on('end', resolve));

    /**
     * In() procura todos os registros de uma vez no banco de dados, comparando com um array
     * As que ele encontrar, ele retorna
     */
    const existentCategories = await categoriesRepository.find({
      where: {
        title: In(categories),
      },
    });

    const existentCategoriesTitles = existentCategories.map(
      (category: Category) => category.title,
    );

    /**
     * Pegando todas as categorias que não existem
     */
    const AddCategoryTitles = categories
      .filter(category => !existentCategoriesTitles.includes(category))
      // Retirando as categorias duplicadas
      .filter((value, index, self) => self.indexOf(value) === index);

    // Pegando cada objeto titulo dentro do array de categorias
    const newCategories = categoriesRepository.create(
      AddCategoryTitles.map(title => ({
        title,
      })),
    );

    await categoriesRepository.save(newCategories);

    const finalCategories = [...newCategories, ...existentCategories];

    const createdTransactions = transactionRepository.create(
      transactions.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: finalCategories.find(
          category => category.title === transaction.category,
        ),
      })),
    );

    await transactionRepository.save(createdTransactions);

    await fs.promises.unlink(filePath);

    return createdTransactions;
  }
}

export default ImportTransactionsService;
