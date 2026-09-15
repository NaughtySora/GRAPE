
import test from "@/utils/test";
import { Address, Profile } from "../../profile/dto";

const { validation: { expectError, expectValid } } = test;

describe("Profile validators", () => {
  it('Address', async () => {
    await expectError(
      Address,
      [
        { a: 1 },
      ],
      [
        { "whitelistValidation": "property a should not exist", }
      ],
    );

    await expectValid(
      Address,
      [{ state: 'a' }, { city: 'a' }],
    );
  });

  it('Profile', async () => {
    await expectError(
      Profile,
      [
        { a: 1 },
      ],
      [
        { "whitelistValidation": "property a should not exist", }
      ],
    );

    await expectValid(
      Profile,
      [{ first_name: 'a' }],
    );
  });
});