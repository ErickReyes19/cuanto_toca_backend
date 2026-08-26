-- AlterTable
ALTER TABLE `usuarios` ADD COLUMN `adminPadreId` VARCHAR(36) NULL,
    ADD COLUMN `ciudad` VARCHAR(100) NULL,
    ADD COLUMN `direccion` VARCHAR(255) NULL,
    ADD COLUMN `estaOnline` BOOLEAN NULL,
    ADD COLUMN `ultimaActividad` DATETIME(3) NULL,
    ADD COLUMN `ultimoInicioSesion` DATETIME(3) NULL;

-- CreateTable
CREATE TABLE `Cliente` (
    `id` VARCHAR(36) NOT NULL,
    `nombre` VARCHAR(100) NOT NULL,
    `apellido` VARCHAR(100) NOT NULL,
    `ciudad` VARCHAR(100) NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `createAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateAt` DATETIME(3) NOT NULL,
    `usuarioAsignadoId` VARCHAR(36) NOT NULL,

    INDEX `IX_Cliente_usuarioAsignadoId`(`usuarioAsignadoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `IX_Usuarios_adminPadreId` ON `Usuarios`(`adminPadreId`);

-- AddForeignKey
ALTER TABLE `Usuarios` ADD CONSTRAINT `Usuarios_adminPadreId_fkey` FOREIGN KEY (`adminPadreId`) REFERENCES `Usuarios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cliente` ADD CONSTRAINT `Cliente_usuarioAsignadoId_fkey` FOREIGN KEY (`usuarioAsignadoId`) REFERENCES `Usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
