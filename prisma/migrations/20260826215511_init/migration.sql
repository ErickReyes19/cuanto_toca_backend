-- CreateTable
CREATE TABLE `Permiso` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191) NOT NULL,
    `createAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateAt` DATETIME(3) NOT NULL,
    `activo` BOOLEAN NOT NULL,

    UNIQUE INDEX `Permiso_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RolPermiso` (
    `id` VARCHAR(191) NOT NULL,
    `rolId` VARCHAR(191) NOT NULL,
    `permisoId` VARCHAR(191) NOT NULL,
    `createAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `RolPermiso_permisoId_fkey`(`permisoId`),
    UNIQUE INDEX `RolPermiso_rolId_permisoId_key`(`rolId`, `permisoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Rol` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191) NOT NULL,
    `createAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateAt` DATETIME(3) NOT NULL,
    `activo` BOOLEAN NOT NULL,

    UNIQUE INDEX `Rol_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Usuarios` (
    `id` VARCHAR(36) NOT NULL,
    `usuario` VARCHAR(50) NOT NULL,
    `contrasena` LONGTEXT NOT NULL,
    `nombre` VARCHAR(100) NULL,
    `fotoUrl` VARCHAR(512) NULL,
    `telefono` VARCHAR(30) NULL,
    `ciudad` VARCHAR(100) NULL,
    `direccion` VARCHAR(255) NULL,
    `DebeCambiarPassword` BOOLEAN NULL,
    `email` VARCHAR(191) NOT NULL,
    `googleSub` VARCHAR(64) NULL,
    `createAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateAt` DATETIME(3) NOT NULL,
    `rol_id` VARCHAR(36) NOT NULL,
    `activo` BIT(1) NOT NULL,
    `estaOnline` BOOLEAN NULL,
    `ultimaActividad` DATETIME(3) NULL,
    `ultimoInicioSesion` DATETIME(3) NULL,

    UNIQUE INDEX `Usuarios_email_key`(`email`),
    UNIQUE INDEX `Usuarios_googleSub_key`(`googleSub`),
    INDEX `IX_Usuarios_rol_id`(`rol_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PasswordResetToken` (
    `id` VARCHAR(36) NOT NULL,
    `userId` VARCHAR(36) NOT NULL,
    `token` VARCHAR(128) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `PasswordResetToken_token_key`(`token`),
    INDEX `IX_PasswordResetToken_userId`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Grupo` (
    `id` VARCHAR(36) NOT NULL,
    `nombre` VARCHAR(120) NOT NULL,
    `descripcion` VARCHAR(500) NULL,
    `tipo` ENUM('VIAJE_REUNION', 'DESPENSA_FAMILIAR') NOT NULL DEFAULT 'VIAJE_REUNION',
    `moneda` VARCHAR(3) NOT NULL DEFAULT 'USD',
    `codigoInvitacion` VARCHAR(16) NOT NULL,
    `invitacionActiva` BOOLEAN NOT NULL DEFAULT true,
    `archivado` BOOLEAN NOT NULL DEFAULT false,
    `propietarioId` VARCHAR(36) NOT NULL,
    `createAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Grupo_codigoInvitacion_key`(`codigoInvitacion`),
    INDEX `IX_Grupo_propietarioId`(`propietarioId`),
    INDEX `IX_Grupo_archivado`(`archivado`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Participante` (
    `id` VARCHAR(36) NOT NULL,
    `grupoId` VARCHAR(36) NOT NULL,
    `nombre` VARCHAR(80) NOT NULL,
    `usuarioId` VARCHAR(36) NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `createAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateAt` DATETIME(3) NOT NULL,

    INDEX `IX_Participante_grupoId`(`grupoId`),
    INDEX `IX_Participante_usuarioId`(`usuarioId`),
    UNIQUE INDEX `UQ_Participante_grupo_usuario`(`grupoId`, `usuarioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CategoriaGasto` (
    `id` VARCHAR(36) NOT NULL,
    `slug` VARCHAR(40) NOT NULL,
    `nombre` VARCHAR(60) NOT NULL,
    `icono` VARCHAR(40) NOT NULL,
    `orden` INTEGER NOT NULL DEFAULT 0,
    `activo` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `CategoriaGasto_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Gasto` (
    `id` VARCHAR(36) NOT NULL,
    `grupoId` VARCHAR(36) NOT NULL,
    `descripcion` VARCHAR(160) NOT NULL,
    `montoCentavos` INTEGER NOT NULL,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `tipoReparto` ENUM('IGUAL', 'EXACTO', 'PORCENTAJE', 'PARTES') NOT NULL DEFAULT 'IGUAL',
    `categoriaId` VARCHAR(36) NULL,
    `pagadoPorId` VARCHAR(36) NOT NULL,
    `nota` VARCHAR(500) NULL,
    `createAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateAt` DATETIME(3) NOT NULL,

    INDEX `IX_Gasto_grupoId`(`grupoId`),
    INDEX `IX_Gasto_pagadoPorId`(`pagadoPorId`),
    INDEX `IX_Gasto_categoriaId`(`categoriaId`),
    INDEX `IX_Gasto_grupo_fecha`(`grupoId`, `fecha`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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

-- CreateTable
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

-- CreateTable
CREATE TABLE `LineaDespensaParticipacion` (
    `id` VARCHAR(36) NOT NULL,
    `lineaId` VARCHAR(36) NOT NULL,
    `participanteId` VARCHAR(36) NOT NULL,
    `montoCentavos` INTEGER NOT NULL,

    INDEX `IX_LineaDespensaParticipacion_participanteId`(`participanteId`),
    UNIQUE INDEX `UQ_LineaDespensa_participante`(`lineaId`, `participanteId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GastoParticipacion` (
    `id` VARCHAR(36) NOT NULL,
    `gastoId` VARCHAR(36) NOT NULL,
    `participanteId` VARCHAR(36) NOT NULL,
    `montoCentavos` INTEGER NOT NULL,
    `pesoEntrada` INTEGER NULL,

    INDEX `IX_Reparto_participanteId`(`participanteId`),
    UNIQUE INDEX `UQ_Reparto_gasto_participante`(`gastoId`, `participanteId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pago` (
    `id` VARCHAR(36) NOT NULL,
    `grupoId` VARCHAR(36) NOT NULL,
    `deParticipanteId` VARCHAR(36) NOT NULL,
    `aParticipanteId` VARCHAR(36) NOT NULL,
    `montoCentavos` INTEGER NOT NULL,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `nota` VARCHAR(300) NULL,
    `createAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `IX_Pago_grupoId`(`grupoId`),
    INDEX `IX_Pago_deParticipanteId`(`deParticipanteId`),
    INDEX `IX_Pago_aParticipanteId`(`aParticipanteId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RolPermiso` ADD CONSTRAINT `RolPermiso_permisoId_fkey` FOREIGN KEY (`permisoId`) REFERENCES `Permiso`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RolPermiso` ADD CONSTRAINT `RolPermiso_rolId_fkey` FOREIGN KEY (`rolId`) REFERENCES `Rol`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Usuarios` ADD CONSTRAINT `Usuarios_rol_id_fkey` FOREIGN KEY (`rol_id`) REFERENCES `Rol`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PasswordResetToken` ADD CONSTRAINT `PasswordResetToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Grupo` ADD CONSTRAINT `Grupo_propietarioId_fkey` FOREIGN KEY (`propietarioId`) REFERENCES `Usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Participante` ADD CONSTRAINT `Participante_grupoId_fkey` FOREIGN KEY (`grupoId`) REFERENCES `Grupo`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Participante` ADD CONSTRAINT `Participante_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuarios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Gasto` ADD CONSTRAINT `Gasto_grupoId_fkey` FOREIGN KEY (`grupoId`) REFERENCES `Grupo`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Gasto` ADD CONSTRAINT `Gasto_categoriaId_fkey` FOREIGN KEY (`categoriaId`) REFERENCES `CategoriaGasto`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Gasto` ADD CONSTRAINT `Gasto_pagadoPorId_fkey` FOREIGN KEY (`pagadoPorId`) REFERENCES `Participante`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CompraDespensa` ADD CONSTRAINT `CompraDespensa_grupoId_fkey` FOREIGN KEY (`grupoId`) REFERENCES `Grupo`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CompraDespensa` ADD CONSTRAINT `CompraDespensa_gastoId_fkey` FOREIGN KEY (`gastoId`) REFERENCES `Gasto`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LineaDespensa` ADD CONSTRAINT `LineaDespensa_compraId_fkey` FOREIGN KEY (`compraId`) REFERENCES `CompraDespensa`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LineaDespensaParticipacion` ADD CONSTRAINT `LineaDespensaParticipacion_lineaId_fkey` FOREIGN KEY (`lineaId`) REFERENCES `LineaDespensa`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LineaDespensaParticipacion` ADD CONSTRAINT `LineaDespensaParticipacion_participanteId_fkey` FOREIGN KEY (`participanteId`) REFERENCES `Participante`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GastoParticipacion` ADD CONSTRAINT `GastoParticipacion_gastoId_fkey` FOREIGN KEY (`gastoId`) REFERENCES `Gasto`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GastoParticipacion` ADD CONSTRAINT `GastoParticipacion_participanteId_fkey` FOREIGN KEY (`participanteId`) REFERENCES `Participante`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pago` ADD CONSTRAINT `Pago_grupoId_fkey` FOREIGN KEY (`grupoId`) REFERENCES `Grupo`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pago` ADD CONSTRAINT `Pago_deParticipanteId_fkey` FOREIGN KEY (`deParticipanteId`) REFERENCES `Participante`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pago` ADD CONSTRAINT `Pago_aParticipanteId_fkey` FOREIGN KEY (`aParticipanteId`) REFERENCES `Participante`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
