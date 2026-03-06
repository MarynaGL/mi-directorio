-- ============================================================
-- SCRIPT COMPLETO - mi_directorio
-- Ejecutar en phpMyAdmin → pestaña SQL
-- ============================================================

USE mi_directorio;

-- Borrar tablas viejas (respetando foreign keys)
DROP TABLE IF EXISTS imagenes;
DROP TABLE IF EXISTS locales;
DROP TABLE IF EXISTS lugar_imagenes;
DROP TABLE IF EXISTS lugares;
DROP TABLE IF EXISTS rubros;
DROP TABLE IF EXISTS ciudades;
DROP TABLE IF EXISTS localidades;
DROP TABLE IF EXISTS provincias;

-- ============================================================
-- ESTRUCTURA NORMALIZADA (3NF)
-- ============================================================

CREATE TABLE provincias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE localidades (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  provincia_id INT NOT NULL,
  FOREIGN KEY (provincia_id) REFERENCES provincias(id) ON DELETE CASCADE,
  UNIQUE KEY uk_localidad (nombre, provincia_id)
);

CREATE TABLE ciudades (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  localidad_id INT NOT NULL,
  FOREIGN KEY (localidad_id) REFERENCES localidades(id) ON DELETE CASCADE,
  UNIQUE KEY uk_ciudad (nombre, localidad_id)
);

CREATE TABLE rubros (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE locales (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  direccion VARCHAR(255) NOT NULL,
  whatsapp VARCHAR(20) NOT NULL,
  video_url VARCHAR(500),
  rubro_id INT NOT NULL,
  ciudad_id INT NOT NULL,
  visible TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (rubro_id) REFERENCES rubros(id),
  FOREIGN KEY (ciudad_id) REFERENCES ciudades(id)
);

CREATE TABLE imagenes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  local_id INT NOT NULL,
  path VARCHAR(500) NOT NULL,
  FOREIGN KEY (local_id) REFERENCES locales(id) ON DELETE CASCADE
);

-- ============================================================
-- DATOS INICIALES (Seeders)
-- ============================================================

-- Las 23 provincias argentinas
INSERT INTO provincias (nombre) VALUES
  ('Buenos Aires'), ('Catamarca'), ('Chaco'), ('Chubut'),
  ('Córdoba'), ('Corrientes'), ('Entre Ríos'), ('Formosa'),
  ('Jujuy'), ('La Pampa'), ('La Rioja'), ('Mendoza'),
  ('Misiones'), ('Neuquén'), ('Río Negro'), ('Salta'),
  ('San Juan'), ('San Luis'), ('Santa Cruz'), ('Santa Fe'),
  ('Santiago del Estero'), ('Tierra del Fuego'), ('Tucumán');

-- Localidades de Buenos Aires
INSERT INTO localidades (nombre, provincia_id) VALUES
  ('Capital Federal', (SELECT id FROM provincias WHERE nombre = 'Buenos Aires')),
  ('Zona Norte GBA',  (SELECT id FROM provincias WHERE nombre = 'Buenos Aires')),
  ('Zona Sur GBA',    (SELECT id FROM provincias WHERE nombre = 'Buenos Aires')),
  ('Zona Oeste GBA',  (SELECT id FROM provincias WHERE nombre = 'Buenos Aires')),
  ('Interior Provincia', (SELECT id FROM provincias WHERE nombre = 'Buenos Aires'));

-- Ciudades de Capital Federal
INSERT INTO ciudades (nombre, localidad_id) VALUES
  ('Palermo',   (SELECT id FROM localidades WHERE nombre = 'Capital Federal')),
  ('Belgrano',  (SELECT id FROM localidades WHERE nombre = 'Capital Federal')),
  ('Recoleta',  (SELECT id FROM localidades WHERE nombre = 'Capital Federal')),
  ('San Telmo', (SELECT id FROM localidades WHERE nombre = 'Capital Federal')),
  ('Caballito', (SELECT id FROM localidades WHERE nombre = 'Capital Federal')),
  ('Flores',    (SELECT id FROM localidades WHERE nombre = 'Capital Federal'));

-- Ciudades de Zona Norte GBA
INSERT INTO ciudades (nombre, localidad_id) VALUES
  ('San Isidro',    (SELECT id FROM localidades WHERE nombre = 'Zona Norte GBA')),
  ('Vicente López', (SELECT id FROM localidades WHERE nombre = 'Zona Norte GBA')),
  ('San Fernando',  (SELECT id FROM localidades WHERE nombre = 'Zona Norte GBA')),
  ('Tigre',         (SELECT id FROM localidades WHERE nombre = 'Zona Norte GBA')),
  ('San Martín',    (SELECT id FROM localidades WHERE nombre = 'Zona Norte GBA')),
  ('Olivos',        (SELECT id FROM localidades WHERE nombre = 'Zona Norte GBA'));

-- Ciudades de Zona Sur GBA
INSERT INTO ciudades (nombre, localidad_id) VALUES
  ('Quilmes',          (SELECT id FROM localidades WHERE nombre = 'Zona Sur GBA')),
  ('Avellaneda',       (SELECT id FROM localidades WHERE nombre = 'Zona Sur GBA')),
  ('Lanús',            (SELECT id FROM localidades WHERE nombre = 'Zona Sur GBA')),
  ('Lomas de Zamora',  (SELECT id FROM localidades WHERE nombre = 'Zona Sur GBA')),
  ('Berazategui',      (SELECT id FROM localidades WHERE nombre = 'Zona Sur GBA'));

-- Ciudades de Zona Oeste GBA
INSERT INTO ciudades (nombre, localidad_id) VALUES
  ('Morón',          (SELECT id FROM localidades WHERE nombre = 'Zona Oeste GBA')),
  ('Merlo',          (SELECT id FROM localidades WHERE nombre = 'Zona Oeste GBA')),
  ('Moreno',         (SELECT id FROM localidades WHERE nombre = 'Zona Oeste GBA')),
  ('Ituzaingó',      (SELECT id FROM localidades WHERE nombre = 'Zona Oeste GBA')),
  ('Tres de Febrero',(SELECT id FROM localidades WHERE nombre = 'Zona Oeste GBA'));

-- Localidades y ciudades de Córdoba
INSERT INTO localidades (nombre, provincia_id) VALUES
  ('Gran Córdoba', (SELECT id FROM provincias WHERE nombre = 'Córdoba')),
  ('Interior Córdoba', (SELECT id FROM provincias WHERE nombre = 'Córdoba'));

INSERT INTO ciudades (nombre, localidad_id) VALUES
  ('Córdoba Capital',  (SELECT id FROM localidades WHERE nombre = 'Gran Córdoba')),
  ('Villa Carlos Paz', (SELECT id FROM localidades WHERE nombre = 'Interior Córdoba')),
  ('Alta Gracia',      (SELECT id FROM localidades WHERE nombre = 'Interior Córdoba')),
  ('Villa María',      (SELECT id FROM localidades WHERE nombre = 'Interior Córdoba'));

-- Localidades y ciudades de Santa Fe
INSERT INTO localidades (nombre, provincia_id) VALUES
  ('Gran Rosario',    (SELECT id FROM provincias WHERE nombre = 'Santa Fe')),
  ('Santa Fe Capital',(SELECT id FROM provincias WHERE nombre = 'Santa Fe'));

INSERT INTO ciudades (nombre, localidad_id) VALUES
  ('Rosario',       (SELECT id FROM localidades WHERE nombre = 'Gran Rosario')),
  ('Villa Gobernador Gálvez', (SELECT id FROM localidades WHERE nombre = 'Gran Rosario')),
  ('Santa Fe',      (SELECT id FROM localidades WHERE nombre = 'Santa Fe Capital'));

-- Localidades y ciudades de Mendoza
INSERT INTO localidades (nombre, provincia_id) VALUES
  ('Gran Mendoza', (SELECT id FROM provincias WHERE nombre = 'Mendoza'));

INSERT INTO ciudades (nombre, localidad_id) VALUES
  ('Mendoza Capital', (SELECT id FROM localidades WHERE nombre = 'Gran Mendoza')),
  ('Godoy Cruz',      (SELECT id FROM localidades WHERE nombre = 'Gran Mendoza')),
  ('Luján de Cuyo',   (SELECT id FROM localidades WHERE nombre = 'Gran Mendoza'));

-- Localidades y ciudades de Tucumán
INSERT INTO localidades (nombre, provincia_id) VALUES
  ('Gran Tucumán', (SELECT id FROM provincias WHERE nombre = 'Tucumán'));

INSERT INTO ciudades (nombre, localidad_id) VALUES
  ('San Miguel de Tucumán', (SELECT id FROM localidades WHERE nombre = 'Gran Tucumán')),
  ('Yerba Buena',           (SELECT id FROM localidades WHERE nombre = 'Gran Tucumán'));

-- Rubros
INSERT INTO rubros (nombre) VALUES
  ('Salud'),
  ('Gastronomía'),
  ('Educación'),
  ('Comercio'),
  ('Servicios'),
  ('Turismo'),
  ('Inmobiliaria'),
  ('Automotor'),
  ('Tecnología'),
  ('Deporte y Bienestar');
