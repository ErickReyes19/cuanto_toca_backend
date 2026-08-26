-- CreateTable
CREATE TABLE `Grupo` (
    `id` VARCHAR(36) NOT NULL,
    `nombre` VARCHAR(120) NOT NULL,
    `descripcion` VARCHAR(500) NULL,
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
ALTER TABLE `GastoParticipacion` ADD CONSTRAINT `GastoParticipacion_gastoId_fkey` FOREIGN KEY (`gastoId`) REFERENCES `Gasto`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GastoParticipacion` ADD CONSTRAINT `GastoParticipacion_participanteId_fkey` FOREIGN KEY (`participanteId`) REFERENCES `Participante`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pago` ADD CONSTRAINT `Pago_grupoId_fkey` FOREIGN KEY (`grupoId`) REFERENCES `Grupo`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pago` ADD CONSTRAINT `Pago_deParticipanteId_fkey` FOREIGN KEY (`deParticipanteId`) REFERENCES `Participante`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pago` ADD CONSTRAINT `Pago_aParticipanteId_fkey` FOREIGN KEY (`aParticipanteId`) REFERENCES `Participante`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
