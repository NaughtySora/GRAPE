import test from "@/utils/test";
import { SignInCredentials, SignUpCredentials } from "../../auth/dto";

const { validation: { expectError, expectValid } } = test;

describe("Auth validators", () => {
  it('SignUpCredentials', async () => {
    await expectError(
      SignUpCredentials,
      [
        {},
        { email: 'test@gmail.com' },
        { email: 'test@gmail.com', password: '12345687' },
        { email: 'test@gmail.com', password: 'aA12345687' },
        { email: 'test@gmail.com', password: '!aA12345687', confirm: '^aA12345687' },
      ],
      [
        {
          "isEmail": "email must be an email",
          "maxLength": "email must be shorter than or equal to 128 characters"
        },
        {
          "isStrongPassword": "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
          "maxLength": "password must be shorter than or equal to 64 characters",
        },
        { "isStrongPassword": "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character." },
        { "isStrongPassword": "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character." },
        { "match": "Passwords do not match.", }
      ],
    );

    await expectValid(
      SignUpCredentials,
      [{
        email: 'naughtysora@proton.me',
        password: 'Aa12345Aa%',
        confirm: 'Aa12345Aa%',
      }],
    );
  });

  it('SignInCredentials', async () => {
    await expectError(
      SignInCredentials,
      [
        {},
        { email: 'test@gmail.com' },
        { email: 'test@gmail.com', password: '12345687' },
        { email: 'test@gmail.com', password: 'aA12345687' },
      ],
      [
        {
          "isEmail": "email must be an email",
          "maxLength": "email must be shorter than or equal to 128 characters"
        },
        {
          "isStrongPassword": "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
          "maxLength": "password must be shorter than or equal to 64 characters",
        },
        { "isStrongPassword": "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character." },
        { "isStrongPassword": "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character." },
      ],
    );

    await expectValid(
      SignInCredentials,
      [{
        email: 'naughtysora@proton.me',
        password: 'Aa12345Aa%',
      }],
    );
  });
});