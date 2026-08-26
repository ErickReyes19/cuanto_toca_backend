-- CreateTable
CREATE TABLE `CodigoAcceso` (
    `id` VARCHAR(36) NOT NULL,
    `usuarioId` VARCHAR(36) NOT NULL,
    `codigoHash` VARCHAR(255) NOT NULL,
    `expiraEn` DATETIME(3) NOT NULL,
    `intentos` INTEGER NOT NULL DEFAULT 0,
    `usadoEn` DATETIME(3) NULL,
    `createAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `IX_CodigoAcceso_usuarioId`(`usuarioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CodigoAcceso` ADD CONSTRAINT `CodigoAcceso_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
