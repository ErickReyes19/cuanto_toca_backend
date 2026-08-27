-- Contactos bidireccionales entre cuentas registradas. Los ids se insertan
-- ordenados por la aplicación para impedir duplicados en ambos sentidos.
CREATE TABLE `Amistad` (
    `id` VARCHAR(36) NOT NULL,
    `usuarioId` VARCHAR(36) NOT NULL,
    `amigoId` VARCHAR(36) NOT NULL,
    `createAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `UQ_Amistad_usuario_amigo`(`usuarioId`, `amigoId`),
    INDEX `IX_Amistad_amigoId`(`amigoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `Amistad` ADD CONSTRAINT `Amistad_usuarioId_fkey`
    FOREIGN KEY (`usuarioId`) REFERENCES `Usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `Amistad` ADD CONSTRAINT `Amistad_amigoId_fkey`
    FOREIGN KEY (`amigoId`) REFERENCES `Usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
