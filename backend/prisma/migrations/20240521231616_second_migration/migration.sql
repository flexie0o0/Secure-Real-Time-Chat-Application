/*
  Warnings:

  - You are about to drop the column `encryptedAESKey` on the `Messages` table. All the data in the column will be lost.
  - You are about to drop the column `encryptedMessage` on the `Messages` table. All the data in the column will be lost.
  - You are about to drop the column `hmac` on the `Messages` table. All the data in the column will be lost.
  - You are about to drop the column `iv` on the `Messages` table. All the data in the column will be lost.
  - You are about to drop the column `encryptedPrivateKey` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `publicKey` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Messages" DROP COLUMN "encryptedAESKey",
DROP COLUMN "encryptedMessage",
DROP COLUMN "hmac",
DROP COLUMN "iv";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "encryptedPrivateKey",
DROP COLUMN "publicKey";
