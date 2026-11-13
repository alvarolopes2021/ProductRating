import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

/**
 * Hashes a plain-text password with bcrypt.
 *
 * bcrypt embeds the salt inside the resulting hash. We also return the salt so
 * it can be persisted in the `accounts.salt` column required by the schema.
 */
export async function hashPassword(
  password: string,
): Promise<{ hash: string; salt: string }> {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  const hash = await bcrypt.hash(password, salt);

  return { hash, salt };
}
