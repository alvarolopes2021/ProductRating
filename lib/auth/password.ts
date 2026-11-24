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

/**
 * Verifies a plain-text password against a stored bcrypt hash.
 *
 * Malformed or missing hashes are treated as an invalid password so callers
 * can keep returning the same generic authentication error.
 */
export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  if (!hash) {
    return false;
  }

  try {
    return await bcrypt.compare(password, hash);
  } catch {
    return false;
  }
}
