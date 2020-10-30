import { getRepository, Repository, In } from 'typeorm';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import Product from '../entities/Product';

interface IFindProducts {
  id: string;
}

class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

  public async create({
    name,
    price,
    quantity,
  }: ICreateProductDTO): Promise<Product> {
    const product = this.ormRepository.create({
      name,
      price,
      quantity,
    });

    await this.ormRepository.save(product);

    return product;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    const product = await this.ormRepository.findOne({
      where: {
        name,
      },
    });

    return product;
  }

  public async findAllById(products: IFindProducts[]): Promise<Product[]> {
    // const productsIds = products.map(product => product.id);

    // const existentProducts = await this.ormRepository.find({
    //   where: {
    //     id: In(productsIds),
    //   },
    // });

    // return existentProducts;

    // 21, 33, 44, 32, 11

    const productsIds = products
      .map(product => product.id)
      .filter((id, pos, arr) => arr.indexOf(id) === pos);

    if (productsIds.length !== products.length)
      throw new AppError('Has products repeated at the list');

    const findedProducts = await this.ormRepository.find({
      where: {
        id: In(productsIds),
      },
    });

    if (findedProducts.length !== productsIds.length)
      throw new AppError('Not all products was booked');

    return findedProducts;
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    const productsIds = products.map(product => product.id);
    const findedProducts = await this.ormRepository.find({
      where: {
        id: In(productsIds),
      },
    });

    const updatedProducts = findedProducts.map(product => {
      const updatedProduct = { ...product };

      const order_product = products.find(item => item.id === product.id);

      updatedProduct.quantity =
        product.quantity - (order_product?.quantity || 0);

      return updatedProduct;
    });

    await this.ormRepository.save(updatedProducts);

    return updatedProducts;
  }
}

export default ProductsRepository;
