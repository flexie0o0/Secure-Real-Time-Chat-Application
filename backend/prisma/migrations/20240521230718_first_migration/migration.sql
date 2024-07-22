/*
  Warnings:

  - Added the required column `hmac` to the `Messages` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Messages" ADD COLUMN     "encryptedAESKey" TEXT,
ADD COLUMN     "encryptedMessage" TEXT,
ADD COLUMN     "hmac" TEXT NOT NULL,
ADD COLUMN     "iv" TEXT NOT NULL DEFAULT 'gen_random_bytes(16)';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "encryptedPrivateKey" TEXT,
ADD COLUMN     "publicKey" TEXT;
