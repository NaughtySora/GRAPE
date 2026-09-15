import { JWT } from "@/application/JWT";

describe('Tokens', () => {
  it('issue/verify', () => {
    const jwt = new JWT({
      access: {
        secret: Buffer.from("access"),
        sign: { expiresIn: 5000, },
      },
      refresh: {
        secret: Buffer.from("refresh"),
        sign: { expiresIn: 5000, },
      },
    });

    const access = jwt.access({ test: 1 });
    const refresh = jwt.refresh({ test: 1 });
    const at = jwt.verify(access);
    const rt = jwt.verify(refresh);
  });

});