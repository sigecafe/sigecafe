import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;
const MIN_PASSWORD_LENGTH = 1;
const MAX_PASSWORD_LENGTH = 72;

class CryptoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CryptoError';
  }
}

/**
 * Validates the input string for hashing/verification
 * @param input - The string to validate
 * @throws CryptoError if validation fails
 */
function validateInput(input: string): void {
  if (typeof input !== 'string') {
    throw new CryptoError('Input must be a string');
  }

  if (input.length < MIN_PASSWORD_LENGTH) {
    throw new CryptoError('Input cannot be empty');
  }

  if (input.length > MAX_PASSWORD_LENGTH) {
    throw new CryptoError(`Input cannot be longer than ${MAX_PASSWORD_LENGTH} characters`);
  }
}

/**
 * Validates a bcrypt hash format
 * @param hash - The hash to validate
 * @throws CryptoError if validation fails
 */
function validateHash(hash: string): void {
  if (typeof hash !== 'string') {
    throw new CryptoError('Hash must be a string');
  }

  if (!hash.match(/^\$2[ayb]\$.{56}$/)) {
    throw new CryptoError('Invalid hash format');
  }
}

/**
 * Hashes a password using bcrypt
 * @param password - The password to hash
 * @returns Promise<string> The hashed password
 * @throws CryptoError if validation fails
 */
export async function hash(password: string): Promise<string> {
  try {
    validateInput(password);
    return await bcrypt.hash(password, SALT_ROUNDS);
  } catch (error) {
    if (error instanceof CryptoError) {
      throw error;
    }
    throw new CryptoError('Failed to hash password');
  }
}

/**
 * Verifies a password against a hash
 * @param password - The password to verify
 * @param hashedPassword - The hash to verify against
 * @returns Promise<boolean> True if password matches
 * @throws CryptoError if validation fails
 */
export async function verify(password: string, hashedPassword: string): Promise<boolean> {
  try {
    validateInput(password);
    validateHash(hashedPassword);
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    if (error instanceof CryptoError) {
      throw error;
    }
    throw new CryptoError('Failed to verify password');
  }
}