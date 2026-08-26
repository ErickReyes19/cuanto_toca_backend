-- DropForeignKey
ALTER TABLE `cliente` DROP FOREIGN KEY `Cliente_usuarioAsignadoId_fkey`;

-- DropForeignKey
ALTER TABLE `usuarios` DROP FOREIGN KEY `Usuarios_adminPadreId_fkey`;

-- DropIndex
DROP INDEX `IX_Usuarios_adminPadreId` ON `usuarios`;

-- AlterTable
ALTER TABLE `usuarios` DROP COLUMN `adminPadreId`;

-- DropTable
DROP TABLE `cliente`;
