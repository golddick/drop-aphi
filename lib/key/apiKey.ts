








// import { getServerAuth } from "@/lib/auth/getauth";
// import { database } from "@/lib/database";
// import crypto from "crypto";
// import jwt, { SignOptions } from "jsonwebtoken";

// const JWT_SECRET = process.env.JWT_SECRET_KEY as string;
// const ENC_SECRET = process.env.ENCRYPTION_SECRET as string;

// if (!JWT_SECRET || !ENC_SECRET) {
//   throw new Error("Missing JWT_SECRET_KEY or ENC_SECRET in environment");
// }

// // --------------------
// // Helpers
// // --------------------

// // Generate API key with proper prefix
// function generateApiKey(isTrial: boolean): string {
//   const prefix = isTrial ? "drop-aphi-key-trial-" : "drop-aphi-key-live-";
//   const random = crypto.randomBytes(9).toString("base64url");
//   return prefix + random;
// }

// function encryptKey(key: string): string {
//   // Ensure ENC_SECRET is exactly 32 bytes for AES-256
//   const keyBuffer = Buffer.from(ENC_SECRET.padEnd(32).slice(0, 32));
//   const iv = crypto.randomBytes(16);
//   const cipher = crypto.createCipheriv("aes-256-cbc", keyBuffer, iv);
//   let encrypted = cipher.update(key, "utf8", "hex");
//   encrypted += cipher.final("hex");
//   return iv.toString("hex") + ":" + encrypted;
// }

// export function decryptKey(encryptedKey: string): string {
//   // Ensure ENC_SECRET is exactly 32 bytes for AES-256
//   const keyBuffer = Buffer.from(ENC_SECRET.padEnd(32).slice(0, 32));
//   const [ivHex, encrypted] = encryptedKey.split(":");
//   const iv = Buffer.from(ivHex, "hex");
//   const decipher = crypto.createDecipheriv("aes-256-cbc", keyBuffer, iv);
//   let decrypted = decipher.update(encrypted, "hex", "utf8");
//   decrypted += decipher.final("utf8");
//   return decrypted;
// }

// function generateJwt(payload: object, expiresIn: string | number = "365d"): string {
//   if (typeof expiresIn === "number") {
//     expiresIn = `${expiresIn}s`;
//   }
//   return jwt.sign(payload, JWT_SECRET, { expiresIn } as SignOptions);
// }

// // Check if user has active premium subscription
// async function checkPremiumSubscription(): Promise<boolean> {
//   const user = await getServerAuth();
//   if (!user) return false;

//   const userData = await database.user.findFirst({
//     where: { userId: user.userId },
//     select: {
//       plan: true,
//       subscriptionStatus: true,
//     },
//   });

//   if (!userData) return false;

//   const isFreePlan = userData.plan === "FREE" ;
//   const hasActiveSubscription = userData.subscriptionStatus === "ACTIVE" ;

//   return hasActiveSubscription && !isFreePlan;
// }

// // --------------------
// // API key functions
// // --------------------

// // Create trial API key (14 days)
// export const createTrialApiKey = async () => {
//   const user = await getServerAuth();
//   if (!user) throw new Error("User not authenticated");

//   const apiKey = generateApiKey(true); // trial prefix
//   const encryptedKey = encryptKey(apiKey);

//   const payload = {
//     id: user.id,
//     userId: user.userId,
//     userName: user.userName || "user",
//     email: user.email || "unknown",
//     senderName: user.SenderName || user.userName || "drop-aphi",
//     type: "trial-api-key",
//   };

//   const jwtToken = generateJwt(payload, "14d");
//   const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

//   const apiKeyRecord = await database.apiKey.create({
//     data: {
//       userId: user.userId,
//       keyHash: encryptedKey,
//       jwt: jwtToken,
//       expiresAt,
//       isTrial: true,
//     },
//   });

//   return { 
//     apiKey, 
//     expiresAt, 
//     isTrial: true,
//     id: apiKeyRecord.id 
//   };
// };

// // Create premium API key (365 days) - Only for premium users
// export const createApiKey = async () => {
//   const user = await getServerAuth();
//   if (!user) throw new Error("User not authenticated");

//   // Check if user has active premium subscription
//   const isPremium = await checkPremiumSubscription();
//   if (!isPremium) {
//     throw new Error("Active premium subscription required to generate API key");
//   }

//   const apiKey = generateApiKey(false); // live prefix
//   const encryptedKey = encryptKey(apiKey);

//   const payload = {
//     id: user.id,
//     userId: user.userId,
//     email: user.email || "unknown",
//     senderName: user.SenderName || user.userName || "drop-aphi",
//     type: "api-key",
//   };

//   const jwtToken = generateJwt(payload, "365d");
//   const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

//   const apiKeyRecord = await database.apiKey.create({
//     data: {
//       userId: user.userId,
//       keyHash: encryptedKey,
//       jwt: jwtToken,
//       expiresAt,
//       isTrial: false,
//     },
//   });

//   return { 
//     apiKey, 
//     expiresAt, 
//     isTrial: false,
//     id: apiKeyRecord.id 
//   };
// };

// // Retrieve existing API key
// export const getApiKey = async () => {
//   const user = await getServerAuth();
//   if (!user) throw new Error("User not authenticated");

//   const record = await database.apiKey.findFirst({
//     where: { userId: user.userId },
//   });

//   if (!record) return null;

//   if (record.isTrial && record.expiresAt < new Date()) {
//     await database.apiKey.delete({ where: { id: record.id } });
//     throw new Error("Trial API key has expired");
//   }

//   const rawKey = decryptKey(record.keyHash);
//   return { 
//     apiKey: rawKey, 
//     expiresAt: record.expiresAt, 
//     isTrial: record.isTrial,
//     id: record.id 
//   };
// };

// // Regenerate API key (premium only)
// export const regenerateApiKey = async () => {
//   const user = await getServerAuth();
//   if (!user) throw new Error("User not authenticated");

//   // Check if user has active premium subscription
//   const isPremium = await checkPremiumSubscription();
//   if (!isPremium) {
//     throw new Error("Active premium subscription required to regenerate API key");
//   }

//   await database.apiKey.deleteMany({ where: { userId: user.userId } });

//   const apiKey = generateApiKey(false); // live prefix
//   const encryptedKey = encryptKey(apiKey);

//   const payload = {
//     id: user.id,
//     userId: user.userId,
//     email: user.email || "unknown",
//     senderName: user.SenderName || user.userName || "drop-aphi",
//     type: "api-key",
//   };

//   const jwtToken = generateJwt(payload, "365d");
//   const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

//   const apiKeyRecord = await database.apiKey.create({
//     data: {
//       userId: user.userId,
//       keyHash: encryptedKey,
//       jwt: jwtToken,
//       expiresAt,
//       isTrial: false,
//     },
//   });

//   return { 
//     apiKey, 
//     expiresAt, 
//     isTrial: false,
//     id: apiKeyRecord.id 
//   };
// };

// // --------------------
// // Verify API key with subscription check
// // --------------------
// export const verifyApiKey = async (providedKey: string) => {
//   try {
//     if (!providedKey) {
//       return { valid: false, message: "API key is required" };
//     }

//     const allKeys = await database.apiKey.findMany({
//       include: {
//         user: {
//           select: {
//             plan: true,
//             subscriptionStatus: true,
//           },
//         },
//       },
//     });

//     let matchedRecord = null;
//     for (const record of allKeys) {
//       try {
//         const rawKey = decryptKey(record.keyHash);
//         if (rawKey === providedKey) {
//           matchedRecord = record;
//           break;
//         }
//       } catch {
//         continue;
//       }
//     }

//     if (!matchedRecord) {
//       return { valid: false, message: "Invalid API key" };
//     }

//     if (matchedRecord.expiresAt < new Date()) {
//       await database.apiKey.delete({ where: { id: matchedRecord.id } });
//       return { valid: false, message: "API key has expired" };
//     }

//     // For non-trial keys, check if user still has active premium subscription
//     if (!matchedRecord.isTrial && matchedRecord.user) {
//       const isFreePlan = matchedRecord.user.plan === "FREE" ;
//       const hasActiveSubscription = matchedRecord.user.subscriptionStatus === "ACTIVE" ;
      
//       if (!hasActiveSubscription || isFreePlan) {
//         await database.apiKey.delete({ where: { id: matchedRecord.id } });
//         return { 
//           valid: false, 
//           message: "API key invalidated due to inactive subscription. Please renew your subscription." 
//         };
//       }
//     }

//     try {
//       const decoded = jwt.verify(matchedRecord.jwt, JWT_SECRET);
//       return {
//         valid: true,
//         message: "API key verified successfully",
//         user: decoded,
//         isTrial: matchedRecord.isTrial,
//         expiresAt: matchedRecord.expiresAt,
//       };
//     } catch {
//       return { valid: false, message: "Invalid or expired token signature" };
//     }
//   } catch (error) {
//     console.error("API key verification error:", error);
//     return { valid: false, message: "Internal verification error" };
//   }
// };









import { getServerAuth } from "@/lib/auth/getauth";
import { database } from "@/lib/database";
import crypto from "crypto";
import jwt, { SignOptions } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET_KEY as string;
const ENC_SECRET = process.env.ENCRYPTION_SECRET as string;

if (!JWT_SECRET || !ENC_SECRET) {
  throw new Error("Missing JWT_SECRET_KEY or ENC_SECRET in environment");
}

// --------------------
// Helpers
// --------------------

// Generate API key with proper prefix
function generateApiKey(isTrial: boolean): string {
  const prefix = isTrial ? "drop-aphi-key-trial-" : "drop-aphi-key-live-";
  const random = crypto.randomBytes(9).toString("base64url");
  return prefix + random;
}

function encryptKey(key: string): string {
  // Ensure ENC_SECRET is exactly 32 bytes for AES-256
  const keyBuffer = Buffer.from(ENC_SECRET.padEnd(32).slice(0, 32));
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", keyBuffer, iv);
  let encrypted = cipher.update(key, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

export function decryptKey(encryptedKey: string): string {
  // Ensure ENC_SECRET is exactly 32 bytes for AES-256
  const keyBuffer = Buffer.from(ENC_SECRET.padEnd(32).slice(0, 32));
  const [ivHex, encrypted] = encryptedKey.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", keyBuffer, iv);
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

// Check if user has active premium subscription
async function checkPremiumSubscription(): Promise<boolean> {
  const user = await getServerAuth();
  if (!user) return false;

  const userData = await database.user.findFirst({
    where: { userId: user.userId },
    select: {
      plan: true,
      subscriptionStatus: true,
    },
  });

  if (!userData) return false;

  const isFreePlan = userData.plan === "FREE" ;
  const hasActiveSubscription = userData.subscriptionStatus === "ACTIVE" ;

  return hasActiveSubscription && !isFreePlan;
}

// --------------------
// API key functions
// --------------------

// Create trial API key (30 days)
export const createTrialApiKey = async () => {
  const user = await getServerAuth();
  if (!user) throw new Error("User not authenticated");

  const apiKey = generateApiKey(true); // trial prefix
  const encryptedKey = encryptKey(apiKey);

  const payload = {
    id: user.id,
    userId: user.userId,
    userName: user.userName || "user",
    email: user.email || "unknown",
    senderName: user.SenderName || user.userName || "drop-aphi",
    type: "trial-api-key",
  };

  // ✅ Changed from 14d to 30d (30 days)
  const jwtToken = generateJwt(payload, "30d");
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  const apiKeyRecord = await database.apiKey.create({
    data: {
      userId: user.userId,
      keyHash: encryptedKey,
      jwt: jwtToken,
      expiresAt,
      isTrial: true,
    },
  });

  return { 
    apiKey, 
    expiresAt, 
    isTrial: true,
    id: apiKeyRecord.id 
  };
};

// Create premium API key (365 days) - Only for premium users
export const createApiKey = async () => {
  const user = await getServerAuth();
  if (!user) throw new Error("User not authenticated");

  // Check if user has active premium subscription
  const isPremium = await checkPremiumSubscription();
  if (!isPremium) {
    throw new Error("Active premium subscription required to generate API key");
  }

  const apiKey = generateApiKey(false); // live prefix
  const encryptedKey = encryptKey(apiKey);

  const payload = {
    id: user.id,
    userId: user.userId,
    email: user.email || "unknown",
    senderName: user.SenderName || user.userName || "drop-aphi",
    type: "api-key",
  };

  const jwtToken = generateJwt(payload, "365d");
  const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

  const apiKeyRecord = await database.apiKey.create({
    data: {
      userId: user.userId,
      keyHash: encryptedKey,
      jwt: jwtToken,
      expiresAt,
      isTrial: false,
    },
  });

  return { 
    apiKey, 
    expiresAt, 
    isTrial: false,
    id: apiKeyRecord.id 
  };
};

// Retrieve existing API key
export const getApiKey = async () => {
  const user = await getServerAuth();
  if (!user) throw new Error("User not authenticated");

  const record = await database.apiKey.findFirst({
    where: { userId: user.userId },
  });

  if (!record) return null;

  if (record.isTrial && record.expiresAt < new Date()) {
    await database.apiKey.delete({ where: { id: record.id } });
    throw new Error("Trial API key has expired");
  }

  const rawKey = decryptKey(record.keyHash);
  return { 
    apiKey: rawKey, 
    expiresAt: record.expiresAt, 
    isTrial: record.isTrial,
    id: record.id 
  };
};

// Regenerate API key (premium only)
export const regenerateApiKey = async () => {
  const user = await getServerAuth();
  if (!user) throw new Error("User not authenticated");

  // Check if user has active premium subscription
  const isPremium = await checkPremiumSubscription();
  if (!isPremium) {
    throw new Error("Active premium subscription required to regenerate API key");
  }

  await database.apiKey.deleteMany({ where: { userId: user.userId } });

  const apiKey = generateApiKey(false); // live prefix
  const encryptedKey = encryptKey(apiKey);

  const payload = {
    id: user.id,
    userId: user.userId,
    email: user.email || "unknown",
    senderName: user.SenderName || user.userName || "drop-aphi",
    type: "api-key",
  };

  const jwtToken = generateJwt(payload, "365d");
  const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

  const apiKeyRecord = await database.apiKey.create({
    data: {
      userId: user.userId,
      keyHash: encryptedKey,
      jwt: jwtToken,
      expiresAt,
      isTrial: false,
    },
  });

  return { 
    apiKey, 
    expiresAt, 
    isTrial: false,
    id: apiKeyRecord.id 
  };
};

// --------------------
// Verify API key with subscription check
// --------------------
export const verifyApiKey = async (providedKey: string) => {
  try {
    if (!providedKey) {
      return { valid: false, message: "API key is required" };
    }

    const allKeys = await database.apiKey.findMany({
      include: {
        user: {
          select: {
            plan: true,
            subscriptionStatus: true,
          },
        },
      },
    });

    let matchedRecord = null;
    for (const record of allKeys) {
      try {
        const rawKey = decryptKey(record.keyHash);
        if (rawKey === providedKey) {
          matchedRecord = record;
          break;
        }
      } catch {
        continue;
      }
    }

    if (!matchedRecord) {
      return { valid: false, message: "Invalid API key" };
    }

    if (matchedRecord.expiresAt < new Date()) {
      await database.apiKey.delete({ where: { id: matchedRecord.id } });
      return { valid: false, message: "API key has expired" };
    }

    // For non-trial keys, check if user still has active premium subscription
    if (!matchedRecord.isTrial && matchedRecord.user) {
      const isFreePlan = matchedRecord.user.plan === "FREE" ;
      const hasActiveSubscription = matchedRecord.user.subscriptionStatus === "ACTIVE" ;
      
      if (!hasActiveSubscription || isFreePlan) {
        await database.apiKey.delete({ where: { id: matchedRecord.id } });
        return { 
          valid: false, 
          message: "API key invalidated due to inactive subscription. Please renew your subscription." 
        };
      }
    }

    try {
      const decoded = jwt.verify(matchedRecord.jwt, JWT_SECRET);
      return {
        valid: true,
        message: "API key verified successfully",
        user: decoded,
        isTrial: matchedRecord.isTrial,
        expiresAt: matchedRecord.expiresAt,
      };
    } catch {
      return { valid: false, message: "Invalid or expired token signature" };
    }
  } catch (error) {
    console.error("API key verification error:", error);
    return { valid: false, message: "Internal verification error" };
  }
};