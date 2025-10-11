import crypto from "crypto";
import jwt, {  SignOptions } from "jsonwebtoken";
import { getServerAuth } from "../auth/getauth";
import { database } from "../database";

const JWT_SECRET = process.env.JWT_SECRET_KEY as string;
const ENC_SECRET = process.env.ENCRYPTION_SECRET as string;

if (!JWT_SECRET || !ENC_SECRET) {
  throw new Error("Missing JWT_SECRET_KEY or ENC_SECRET in environment");
}

// --------------------
// Helpers
// --------------------

function generateApiKey(): string {
  const prefix = "drop-aphi-key-";
  const random = crypto.randomBytes(9).toString("base64url");
  return prefix + random;
}

function encryptKey(key: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(ENC_SECRET), iv);
  let encrypted = cipher.update(key, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

export function decryptKey(encryptedKey: string): string {
  const [ivHex, encrypted] = encryptedKey.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(ENC_SECRET), iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

function generateJwt(payload: object, expiresIn: string | number = "365d"): string {
  if (typeof expiresIn === "number") {
    expiresIn = `${expiresIn}s`;
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as SignOptions);
}

// --------------------
// API key functions
// --------------------

// Create trial API key (14 days)
export const createTrialApiKey = async () => {
  const user = await getServerAuth();
  if (!user) throw new Error("User not authenticated");

  const apiKey = generateApiKey();
  const encryptedKey = encryptKey(apiKey);

  const payload = {
    id: user.id,
    userId:user.userId,
    userName: user.userName || "user",
    email: user.email || "unknown",
    senderName: user.SenderName || "drop-aphi",
    type: "trial-api-key",
  };
  
  // 14 days trial
  const jwtToken = generateJwt(payload, "14d");
  const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

  await database.apiKey.create({
    data: {
      userId: user.userId,
      keyHash: encryptedKey, 
      jwt: jwtToken,
      expiresAt,
      isTrial: true, // Mark as trial key
    },
  });

  return { apiKey, expiresAt, isTrial: true };
};

// Create premium API key (365 days)
export const createApiKey = async () => {
  const user = await getServerAuth();
  if (!user) throw new Error("User not authenticated");

  const apiKey = generateApiKey();
  const encryptedKey = encryptKey(apiKey);

  const payload = {
    id: user.id,
    userId:user.userId,
    email: user.email || "unknown",
    senderName: user.SenderName || "drop-aphi",
    type: "api-key",
  };
  
  const jwtToken = generateJwt(payload, "365d");
  const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

  await database.apiKey.create({
    data: {
      userId: user.userId,
      keyHash: encryptedKey,
      jwt: jwtToken,
      expiresAt,
      isTrial: false,
    },
  });

  return { apiKey, expiresAt, isTrial: false };
};

// Retrieve existing API key
export const getApiKey = async () => {
  const user = await getServerAuth();
  if (!user) throw new Error("User not authenticated");

  const record = await database.apiKey.findFirst({ 
    where: { userId: user.userId } 
  });
  
  if (!record) return null;

  // Check if trial key has expired
  if (record.isTrial && record.expiresAt < new Date()) {
    await database.apiKey.delete({ where: { id: record.id } });
    throw new Error("Trial API key has expired");
  }

  const rawKey = decryptKey(record.keyHash);
  return { apiKey: rawKey, expiresAt: record.expiresAt, isTrial: record.isTrial };
};

// Regenerate API key (premium only)
export const regenerateApiKey = async () => {
  const user = await getServerAuth();
  if (!user) throw new Error("User not authenticated");

  // Delete old keys
  await database.apiKey.deleteMany({ where: { userId: user.userId } });

  // Create new premium key
  const apiKey = generateApiKey();
  const encryptedKey = encryptKey(apiKey);

  const payload = {
    id: user.id,
    userId:user.userId,
    email: user.email || "unknown",
    senderName: user.SenderName || "drop-aphi",
    type: "api-key",
  };
  
  const jwtToken = generateJwt(payload, "365d");
  const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

  await database.apiKey.create({
    data: {
      userId: user.userId,
      keyHash: encryptedKey,
      jwt: jwtToken,
      expiresAt,
      isTrial: false,
    },
  });

  return { apiKey, expiresAt, isTrial: false };
};




// --------------------
// Verify API key
// --------------------

export const verifyApiKey = async (providedKey: string) => {
  try {
    if (!providedKey) {
      return { valid: false, message: "API key is required" };
    }

    // ✅ Find all API key records (user might have multiple regenerations)
    const allKeys = await database.apiKey.findMany();

    // ✅ Try matching provided key with decrypted stored ones
    let matchedRecord = null;
    for (const record of allKeys) {
      try {
        const rawKey = decryptKey(record.keyHash);
        if (rawKey === providedKey) {
          matchedRecord = record;
          break;
        }
      } catch {
        continue; // skip if decryption fails
      }
    }

    if (!matchedRecord) {
      return { valid: false, message: "Invalid API key" };
    }

    // ✅ Check expiry
    if (matchedRecord.expiresAt < new Date()) {
      await database.apiKey.delete({ where: { id: matchedRecord.id } });
      return { valid: false, message: "API key has expired" };
    }

    // ✅ Verify JWT signature
    try {
      const decoded = jwt.verify(matchedRecord.jwt, JWT_SECRET);
      return {
        valid: true,
        message: "API key verified successfully",
        user: decoded,
        isTrial: matchedRecord.isTrial,
        expiresAt: matchedRecord.expiresAt,
      };
    } catch (jwtError) {
      return { valid: false, message: "Invalid or expired token signature" };
    }
  } catch (error) {
    console.error("API key verification error:", error);
    return { valid: false, message: "Internal verification error" };
  }
};
