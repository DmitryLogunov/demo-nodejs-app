import { UsersService } from '@/resources/users/users.service';
import { UserRegisterInput } from '@/resources/users/users.types';

describe('UsersService', () => {
  it('create user', async () => {
    const response =
      await UsersService.createUser({ email: undefined, password: undefined } as unknown as UserRegisterInput);

    expect(response.status).toBe('ERROR');
    expect(response.httpCode).toBe(400);
    expect(response.info).toMatch(/user input validation error/);
  })

  //TODO: add unit tests for methods: createUser(), login(), logout(), updateUserPassword()
})
