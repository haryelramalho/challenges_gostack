import AppError from '@shared/errors/AppError';

import FakeCustomersRepository from '@modules/customers/repositories/fakes/FakeCustomersRepository';
import CreateCustomerService from '@modules/customers/services/CreateCustomerService';

let fakeCustomersRepository: FakeCustomersRepository;
let createCustomer: CreateCustomerService;

describe('CreateUser', () => {
  beforeEach(() => {
    fakeCustomersRepository = new FakeCustomersRepository();
    createCustomer = new CreateCustomerService(fakeCustomersRepository);
  });

  it('should be able to create a new customer', async () => {
    const customer = await createCustomer.execute({
      name: 'John Doe',
      email: 'johndoe@example.com',
    });

    expect(customer).toHaveProperty('id');
  });

  it('should not be able to create a customer with one e-mail thats already registered', async () => {
    await createCustomer.execute({
      name: 'John Doe',
      email: 'johndoe@example.com',
    });

    await expect(
      createCustomer.execute({
        name: 'John Doe',
        email: 'johndoe@example.com',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
