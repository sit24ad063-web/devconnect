import { signToken, verifyToken } from "../src/utils/token";

describe("token utils", () => {
  it("signs a token that verifies back to the same user id", () => {
    const token = signToken("user-123");
    const payload = verifyToken(token);
    expect(payload.sub).toBe("user-123");
  });

  it("throws when verifying a garbage token", () => {
    expect(() => verifyToken("not-a-real-token")).toThrow();
  });
});
