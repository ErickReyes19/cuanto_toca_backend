-- CreateTable
CREATE TABLE `GastoPagador` (
    `id` VARCHAR(36) NOT NULL,
    `gastoId` VARCHAR(36) NOT NULL,
    `participanteId` VARCHAR(36) NOT NULL,
    `montoCentavos` INTEGER NOT NULL,

    INDEX `IX_GastoPagador_participanteId`(`participanteId`),
    UNIQUE INDEX `UQ_Pagador_gasto_participante`(`gastoId`, `participanteId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Traspasa los gastos existentes: cada uno queda con su pagador único
-- cubriendo el monto completo, que es exactamente lo que significaban antes.
INSERT INTO `GastoPagador` (`id`, `gastoId`, `participanteId`, `montoCentavos`)
SELECT UUID(), `id`, `pagadoPorId`, `montoCentavos` FROM `Gasto`;

-- AddForeignKey
ALTER TABLE `GastoPagador` ADD CONSTRAINT `GastoPagador_gastoId_fkey` FOREIGN KEY (`gastoId`) REFERENCES `Gasto`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GastoPagador` ADD CONSTRAINT `GastoPagador_participanteId_fkey` FOREIGN KEY (`participanteId`) REFERENCES `Participante`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- DropForeignKey
ALTER TABLE `Gasto` DROP FOREIGN KEY `Gasto_pagadoPorId_fkey`;

-- DropIndex
DROP INDEX `IX_Gasto_pagadoPorId` ON `Gasto`;

-- AlterTable
ALTER TABLE `Gasto` DROP COLUMN `pagadoPorId`;
