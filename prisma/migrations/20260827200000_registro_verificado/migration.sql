-- CreateTable
CREATE TABLE `RegistroPendiente` (
    `id` VARCHAR(36) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(100) NOT NULL,
    `contrasenaHash` VARCHAR(255) NOT NULL,
    `codigoHash` VARCHAR(255) NOT NULL,
    `expiraEn` DATETIME(3) NOT NULL,
    `intentos` INTEGER NOT NULL DEFAULT 0,
    `createAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `RegistroPendiente_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
