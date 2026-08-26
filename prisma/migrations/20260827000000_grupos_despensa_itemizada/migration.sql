-- AddColumn
ALTER TABLE `Grupo` ADD COLUMN `tipo` ENUM('VIAJE_REUNION', 'DESPENSA_FAMILIAR') NOT NULL DEFAULT 'VIAJE_REUNION' AFTER `descripcion`;

-- CreateTable
CREATE TABLE `CompraDespensa` (
    `id` VARCHAR(36) NOT NULL,
    `grupoId` VARCHAR(36) NOT NULL,
    `gastoId` VARCHAR(36) NOT NULL,
    `createAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateAt` DATETIME(3) NOT NULL,
    UNIQUE INDEX `CompraDespensa_gastoId_key`(`gastoId`),
    INDEX `IX_CompraDespensa_grupoId`(`grupoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `LineaDespensa` (
    `id` VARCHAR(36) NOT NULL,
    `compraId` VARCHAR(36) NOT NULL,
    `descripcion` VARCHAR(160) NOT NULL,
    `montoCentavos` INTEGER NOT NULL,
    `orden` INTEGER NOT NULL,
    `createAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `IX_LineaDespensa_compraId`(`compraId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `LineaDespensaParticipacion` (
    `id` VARCHAR(36) NOT NULL,
    `lineaId` VARCHAR(36) NOT NULL,
    `participanteId` VARCHAR(36) NOT NULL,
    `montoCentavos` INTEGER NOT NULL,
    UNIQUE INDEX `UQ_LineaDespensa_participante`(`lineaId`, `participanteId`),
    INDEX `IX_LineaDespensaParticipacion_participanteId`(`participanteId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `CompraDespensa` ADD CONSTRAINT `CompraDespensa_grupoId_fkey` FOREIGN KEY (`grupoId`) REFERENCES `Grupo`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `CompraDespensa` ADD CONSTRAINT `CompraDespensa_gastoId_fkey` FOREIGN KEY (`gastoId`) REFERENCES `Gasto`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `LineaDespensa` ADD CONSTRAINT `LineaDespensa_compraId_fkey` FOREIGN KEY (`compraId`) REFERENCES `CompraDespensa`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `LineaDespensaParticipacion` ADD CONSTRAINT `LineaDespensaParticipacion_lineaId_fkey` FOREIGN KEY (`lineaId`) REFERENCES `LineaDespensa`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `LineaDespensaParticipacion` ADD CONSTRAINT `LineaDespensaParticipacion_participanteId_fkey` FOREIGN KEY (`participanteId`) REFERENCES `Participante`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
