import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,

    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,

    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    // const customerExists = await this.customersRepository.findById(customer_id);

    // if (!customerExists)
    //   throw new AppError('Could not find any customer with the given id');

    // const existentProducts = await this.productsRepository.findAllById(
    //   products,
    // );

    // if (!existentProducts.length)
    //   throw new AppError('Could not find any products with the given ids');

    // // [1, 2, 3, 4]
    // const existentProductsIds = existentProducts.map(product => product.id);

    // const checkInexistentProducts = products.filter(
    //   product => !existentProductsIds.includes(product.id),
    // );

    // if (checkInexistentProducts) {
    //   throw new AppError(
    //     `Could not find product ${checkInexistentProducts[0].id}`,
    //   );
    // }

    // const findProductsWithNoQuantityAvailable = products.filter(
    //   product =>
    //     existentProducts.filter(p => p.id === product.id)[0].quantity <
    //     product.quantity,
    // );

    // if (findProductsWithNoQuantityAvailable.length)
    //   throw new AppError(
    //     `The quantity ${findProductsWithNoQuantityAvailable} is not available for ${findProductsWithNoQuantityAvailable[0].id}`,
    //   );

    // const serializedProducts = products.map(product => ({
    //   product_id: product.id,
    //   quantity: product.quantity,
    //   price: existentProducts.filter(p => p.id === product.id)[0].price,
    // }));

    // const order = await this.ordersRepository.create({
    //   customer: customerExists,
    //   products: serializedProducts,
    // });

    // const { order_products } = order;

    // // Poderia ser products também

    // const orderedProductsQuantity = order_products.map(product => ({
    //   id: product.product.id,
    //   quantity:
    //     existentProducts.filter(p => p.id === product.product.id)[0].quantity -
    //     product.quantity,
    // }));

    // await this.productsRepository.updateQuantity(orderedProductsQuantity);

    // return order;

    const customer = await this.customersRepository.findById(customer_id);

    if (!customer) throw new AppError('This customers not exists');

    const findAllProducts = await this.productsRepository.findAllById(products);

    findAllProducts.forEach(currentProduct => {
      const product = products.find(p => p.id === currentProduct.id);

      if (product && product.quantity > currentProduct.quantity)
        throw new AppError('The number of items listed is not enough');
    });

    const orders_products = products.map(product => {
      const unitPrice = findAllProducts.find(p => p.id === product.id)?.price;

      const order_product = {
        product_id: product.id,
        price: unitPrice || 0,
        quantity: product.quantity,
      };

      return order_product;
    });

    const order = await this.ordersRepository.create({
      customer,
      products: orders_products,
    });

    await this.productsRepository.updateQuantity(products);

    return order;
  }
}

export default CreateOrderService;
