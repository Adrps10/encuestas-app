-- =====================================================
-- CREAR TABLAS SOLO SI NO EXISTEN
-- =====================================================

-- Crear tabla marcas
CREATE TABLE IF NOT EXISTS marcas (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    nombre_corto VARCHAR(50),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    orden INTEGER DEFAULT 0
);

-- Crear tabla clientes
CREATE TABLE IF NOT EXISTS clientes (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100),
    email VARCHAR(100) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    fecha_registro TIMESTAMP
);

-- Crear tabla encuestas
CREATE TABLE IF NOT EXISTS encuestas (
    id BIGSERIAL PRIMARY KEY,
    token VARCHAR(36) NOT NULL UNIQUE,
    tipo VARCHAR(20) NOT NULL,
    estado VARCHAR(20) NOT NULL,
    fecha_envio TIMESTAMP,
    fecha_respuesta TIMESTAMP,
    fecha_expiracion TIMESTAMP,
    cliente_id BIGINT NOT NULL REFERENCES clientes(id),
    marca_id BIGINT NOT NULL REFERENCES marcas(id)
);

-- Crear tabla preguntas
CREATE TABLE IF NOT EXISTS preguntas (
    id BIGSERIAL PRIMARY KEY,
    texto VARCHAR(500) NOT NULL,
    orden INTEGER,
    obligatoria BOOLEAN DEFAULT TRUE,
    tipo VARCHAR(20) NOT NULL,
    marca_id BIGINT NOT NULL REFERENCES marcas(id)
);

-- Crear tabla opciones
CREATE TABLE IF NOT EXISTS opciones (
    id BIGSERIAL PRIMARY KEY,
    texto VARCHAR(255) NOT NULL,
    valor INTEGER,
    orden INTEGER,
    pregunta_id BIGINT NOT NULL REFERENCES preguntas(id)
);

-- Crear tabla respuestas
CREATE TABLE IF NOT EXISTS respuestas (
    id BIGSERIAL PRIMARY KEY,
    valor_texto VARCHAR(1000),
    valor_numerico INTEGER,
    encuesta_id BIGINT NOT NULL REFERENCES encuestas(id),
    pregunta_id BIGINT NOT NULL REFERENCES preguntas(id),
    opcion_id BIGINT REFERENCES opciones(id)
);

-- =====================================================
-- INSERTAR MARCAS (SOLO SI NO EXISTEN)
-- =====================================================
INSERT INTO marcas (nombre, nombre_corto, orden) VALUES 
('Toyota Pachuca', 'Toyota P', 1),
('Carsline Pachuca', 'Carsline P', 2),
('Carsline Queretaro', 'Carsline Q', 3),
('GWM Queretaro', 'GWM', 4),
('Subaru', 'Subaru', 5),
('ComproCars Queretaro', 'ComproCars Q', 6),
('Compro Pachuca', 'Compro P', 7)
ON CONFLICT (nombre) DO NOTHING;

-- =====================================================
-- INSERTAR PREGUNTAS Y OPCIONES PARA CADA MARCA
-- =====================================================

-- TOYOTA PACHUCA (VENTA)
INSERT INTO preguntas (texto, orden, obligatoria, tipo, marca_id) VALUES
('Nombre completo', 1, true, 'TEXTO', 1),
('Como evaluaria su experiencia con la agencia?', 2, true, 'ESCALA', 1),
('Como calificaria su experiencia con su asesor de ventas?', 3, true, 'ESCALA', 1),
('Como calificaria su experiencia de entrega de su vehiculo?', 4, true, 'ESCALA', 1),
('Como evaluaria su experiencia de financiamiento con el distribuidor?', 5, true, 'ESCALA', 1),
('Recomendaria nuestra agencia con familiares y conocidos?', 6, true, 'SI_NO', 1),
('Comentarios adicionales', 7, false, 'TEXTO', 1)
ON CONFLICT DO NOTHING;

-- Opciones para escala (1-5) - Toyota
INSERT INTO opciones (texto, valor, orden, pregunta_id)
SELECT '1 - Deficiente', 1, 1, id FROM preguntas WHERE marca_id = 1 AND tipo = 'ESCALA'
UNION ALL
SELECT '2', 2, 2, id FROM preguntas WHERE marca_id = 1 AND tipo = 'ESCALA'
UNION ALL
SELECT '3', 3, 3, id FROM preguntas WHERE marca_id = 1 AND tipo = 'ESCALA'
UNION ALL
SELECT '4', 4, 4, id FROM preguntas WHERE marca_id = 1 AND tipo = 'ESCALA'
UNION ALL
SELECT '5 - Excelente', 5, 5, id FROM preguntas WHERE marca_id = 1 AND tipo = 'ESCALA'
ON CONFLICT DO NOTHING;

-- Opciones para SI/NO - Toyota
INSERT INTO opciones (texto, valor, orden, pregunta_id)
SELECT 'Si', 1, 1, id FROM preguntas WHERE marca_id = 1 AND tipo = 'SI_NO'
UNION ALL
SELECT 'No', 0, 2, id FROM preguntas WHERE marca_id = 1 AND tipo = 'SI_NO'
ON CONFLICT DO NOTHING;

-- =====================================================
-- CARS LINE PACHUCA (SERVICIO)
INSERT INTO preguntas (texto, orden, obligatoria, tipo, marca_id) VALUES
('Nombre completo', 1, true, 'TEXTO', 2),
('Como evaluaria su experiencia con la agencia?', 2, true, 'ESCALA', 2),
('Como calificaria su experiencia con el asesor de servicio?', 3, true, 'ESCALA', 2),
('Recomendaria nuestro servicio?', 4, true, 'SI_NO', 2),
('Algo que podamos mejorar durante su estancia?', 5, false, 'TEXTO', 2)
ON CONFLICT DO NOTHING;

-- Opciones para escala (1-5) - Carsline Pachuca
INSERT INTO opciones (texto, valor, orden, pregunta_id)
SELECT '1 - Deficiente', 1, 1, id FROM preguntas WHERE marca_id = 2 AND tipo = 'ESCALA'
UNION ALL
SELECT '2', 2, 2, id FROM preguntas WHERE marca_id = 2 AND tipo = 'ESCALA'
UNION ALL
SELECT '3', 3, 3, id FROM preguntas WHERE marca_id = 2 AND tipo = 'ESCALA'
UNION ALL
SELECT '4', 4, 4, id FROM preguntas WHERE marca_id = 2 AND tipo = 'ESCALA'
UNION ALL
SELECT '5 - Excelente', 5, 5, id FROM preguntas WHERE marca_id = 2 AND tipo = 'ESCALA'
ON CONFLICT DO NOTHING;

-- Opciones para SI/NO - Carsline Pachuca
INSERT INTO opciones (texto, valor, orden, pregunta_id)
SELECT 'Si', 1, 1, id FROM preguntas WHERE marca_id = 2 AND tipo = 'SI_NO'
UNION ALL
SELECT 'No', 0, 2, id FROM preguntas WHERE marca_id = 2 AND tipo = 'SI_NO'
ON CONFLICT DO NOTHING;

-- =====================================================
-- CARS LINE QUERETARO (SERVICIO)
INSERT INTO preguntas (texto, orden, obligatoria, tipo, marca_id) VALUES
('Nombre completo', 1, true, 'TEXTO', 3),
('Como evaluaria su experiencia con la agencia?', 2, true, 'ESCALA', 3),
('Como calificaria su experiencia con el asesor de servicio?', 3, true, 'ESCALA', 3),
('Recomendaria nuestro servicio?', 4, true, 'SI_NO', 3),
('Algo que podamos mejorar durante su estancia?', 5, false, 'TEXTO', 3)
ON CONFLICT DO NOTHING;

-- Opciones para escala (1-5) - Carsline Queretaro
INSERT INTO opciones (texto, valor, orden, pregunta_id)
SELECT '1 - Deficiente', 1, 1, id FROM preguntas WHERE marca_id = 3 AND tipo = 'ESCALA'
UNION ALL
SELECT '2', 2, 2, id FROM preguntas WHERE marca_id = 3 AND tipo = 'ESCALA'
UNION ALL
SELECT '3', 3, 3, id FROM preguntas WHERE marca_id = 3 AND tipo = 'ESCALA'
UNION ALL
SELECT '4', 4, 4, id FROM preguntas WHERE marca_id = 3 AND tipo = 'ESCALA'
UNION ALL
SELECT '5 - Excelente', 5, 5, id FROM preguntas WHERE marca_id = 3 AND tipo = 'ESCALA'
ON CONFLICT DO NOTHING;

-- Opciones para SI/NO - Carsline Queretaro
INSERT INTO opciones (texto, valor, orden, pregunta_id)
SELECT 'Si', 1, 1, id FROM preguntas WHERE marca_id = 3 AND tipo = 'SI_NO'
UNION ALL
SELECT 'No', 0, 2, id FROM preguntas WHERE marca_id = 3 AND tipo = 'SI_NO'
ON CONFLICT DO NOTHING;

-- =====================================================
-- GWM QUERETARO (VENTA)
INSERT INTO preguntas (texto, orden, obligatoria, tipo, marca_id) VALUES
('Nombre completo', 1, true, 'TEXTO', 4),
('Como evaluaria su experiencia con la agencia?', 2, true, 'ESCALA', 4),
('Como calificaria su experiencia con su asesor de ventas?', 3, true, 'ESCALA', 4),
('Como calificaria su experiencia de entrega de su vehiculo?', 4, true, 'ESCALA', 4),
('Como evaluaria su experiencia de financiamiento con el distribuidor?', 5, true, 'ESCALA', 4),
('Recomendaria nuestra agencia con familiares y conocidos?', 6, true, 'SI_NO', 4),
('Comentarios adicionales', 7, false, 'TEXTO', 4)
ON CONFLICT DO NOTHING;

-- Opciones para escala (1-5) - GWM
INSERT INTO opciones (texto, valor, orden, pregunta_id)
SELECT '1 - Deficiente', 1, 1, id FROM preguntas WHERE marca_id = 4 AND tipo = 'ESCALA'
UNION ALL
SELECT '2', 2, 2, id FROM preguntas WHERE marca_id = 4 AND tipo = 'ESCALA'
UNION ALL
SELECT '3', 3, 3, id FROM preguntas WHERE marca_id = 4 AND tipo = 'ESCALA'
UNION ALL
SELECT '4', 4, 4, id FROM preguntas WHERE marca_id = 4 AND tipo = 'ESCALA'
UNION ALL
SELECT '5 - Excelente', 5, 5, id FROM preguntas WHERE marca_id = 4 AND tipo = 'ESCALA'
ON CONFLICT DO NOTHING;

-- Opciones para SI/NO - GWM
INSERT INTO opciones (texto, valor, orden, pregunta_id)
SELECT 'Si', 1, 1, id FROM preguntas WHERE marca_id = 4 AND tipo = 'SI_NO'
UNION ALL
SELECT 'No', 0, 2, id FROM preguntas WHERE marca_id = 4 AND tipo = 'SI_NO'
ON CONFLICT DO NOTHING;

-- =====================================================
-- SUBARU (VENTA)
INSERT INTO preguntas (texto, orden, obligatoria, tipo, marca_id) VALUES
('Nombre completo', 1, true, 'TEXTO', 5),
('Como evaluaria su experiencia con la agencia?', 2, true, 'ESCALA', 5),
('Como calificaria su experiencia con su asesor de ventas?', 3, true, 'ESCALA', 5),
('Como calificaria su experiencia de entrega de su vehiculo?', 4, true, 'ESCALA', 5),
('Como evaluaria su experiencia de financiamiento con el distribuidor?', 5, true, 'ESCALA', 5),
('Recomendaria nuestra agencia con familiares y conocidos?', 6, true, 'SI_NO', 5),
('Comentarios adicionales', 7, false, 'TEXTO', 5)
ON CONFLICT DO NOTHING;

-- Opciones para escala (1-5) - Subaru
INSERT INTO opciones (texto, valor, orden, pregunta_id)
SELECT '1 - Deficiente', 1, 1, id FROM preguntas WHERE marca_id = 5 AND tipo = 'ESCALA'
UNION ALL
SELECT '2', 2, 2, id FROM preguntas WHERE marca_id = 5 AND tipo = 'ESCALA'
UNION ALL
SELECT '3', 3, 3, id FROM preguntas WHERE marca_id = 5 AND tipo = 'ESCALA'
UNION ALL
SELECT '4', 4, 4, id FROM preguntas WHERE marca_id = 5 AND tipo = 'ESCALA'
UNION ALL
SELECT '5 - Excelente', 5, 5, id FROM preguntas WHERE marca_id = 5 AND tipo = 'ESCALA'
ON CONFLICT DO NOTHING;

-- Opciones para SI/NO - Subaru
INSERT INTO opciones (texto, valor, orden, pregunta_id)
SELECT 'Si', 1, 1, id FROM preguntas WHERE marca_id = 5 AND tipo = 'SI_NO'
UNION ALL
SELECT 'No', 0, 2, id FROM preguntas WHERE marca_id = 5 AND tipo = 'SI_NO'
ON CONFLICT DO NOTHING;

-- =====================================================
-- COMPROCARS QUERETARO (COMPRA)
INSERT INTO preguntas (texto, orden, obligatoria, tipo, marca_id) VALUES
('Nombre completo', 1, true, 'TEXTO', 6),
('Como evaluaria su experiencia con la agencia?', 2, true, 'ESCALA', 6),
('Como calificaria su experiencia con su asesor de compras?', 3, true, 'ESCALA', 6),
('Como evaluaria el tramite realizado para la compra de su vehiculo?', 4, true, 'ESCALA', 6),
('Recomendaria nuestra agencia con sus familiares y conocidos?', 5, true, 'SI_NO', 6),
('Comentarios adicionales', 6, false, 'TEXTO', 6)
ON CONFLICT DO NOTHING;

-- Opciones para escala (1-5) - ComproCars Queretaro
INSERT INTO opciones (texto, valor, orden, pregunta_id)
SELECT '1 - Deficiente', 1, 1, id FROM preguntas WHERE marca_id = 6 AND tipo = 'ESCALA'
UNION ALL
SELECT '2', 2, 2, id FROM preguntas WHERE marca_id = 6 AND tipo = 'ESCALA'
UNION ALL
SELECT '3', 3, 3, id FROM preguntas WHERE marca_id = 6 AND tipo = 'ESCALA'
UNION ALL
SELECT '4', 4, 4, id FROM preguntas WHERE marca_id = 6 AND tipo = 'ESCALA'
UNION ALL
SELECT '5 - Excelente', 5, 5, id FROM preguntas WHERE marca_id = 6 AND tipo = 'ESCALA'
ON CONFLICT DO NOTHING;

-- Opciones para SI/NO - ComproCars Queretaro
INSERT INTO opciones (texto, valor, orden, pregunta_id)
SELECT 'Si', 1, 1, id FROM preguntas WHERE marca_id = 6 AND tipo = 'SI_NO'
UNION ALL
SELECT 'No', 0, 2, id FROM preguntas WHERE marca_id = 6 AND tipo = 'SI_NO'
ON CONFLICT DO NOTHING;

-- =====================================================
-- COMPRO PACHUCA (COMPRA)
INSERT INTO preguntas (texto, orden, obligatoria, tipo, marca_id) VALUES
('Nombre completo', 1, true, 'TEXTO', 7),
('Como evaluaria su experiencia con la agencia?', 2, true, 'ESCALA', 7),
('Como calificaria su experiencia con su asesor de compras?', 3, true, 'ESCALA', 7),
('Como evaluaria el tramite realizado para la compra de su vehiculo?', 4, true, 'ESCALA', 7),
('Recomendaria nuestra agencia con sus familiares y conocidos?', 5, true, 'SI_NO', 7),
('Comentarios adicionales', 6, false, 'TEXTO', 7)
ON CONFLICT DO NOTHING;

-- Opciones para escala (1-5) - Compro Pachuca
INSERT INTO opciones (texto, valor, orden, pregunta_id)
SELECT '1 - Deficiente', 1, 1, id FROM preguntas WHERE marca_id = 7 AND tipo = 'ESCALA'
UNION ALL
SELECT '2', 2, 2, id FROM preguntas WHERE marca_id = 7 AND tipo = 'ESCALA'
UNION ALL
SELECT '3', 3, 3, id FROM preguntas WHERE marca_id = 7 AND tipo = 'ESCALA'
UNION ALL
SELECT '4', 4, 4, id FROM preguntas WHERE marca_id = 7 AND tipo = 'ESCALA'
UNION ALL
SELECT '5 - Excelente', 5, 5, id FROM preguntas WHERE marca_id = 7 AND tipo = 'ESCALA'
ON CONFLICT DO NOTHING;

-- Opciones para SI/NO - Compro Pachuca
INSERT INTO opciones (texto, valor, orden, pregunta_id)
SELECT 'Si', 1, 1, id FROM preguntas WHERE marca_id = 7 AND tipo = 'SI_NO'
UNION ALL
SELECT 'No', 0, 2, id FROM preguntas WHERE marca_id = 7 AND tipo = 'SI_NO'
ON CONFLICT DO NOTHING;