/**
 * seed-locations.js
 * Carga Provincias → Departamentos → Localidades del Excel al MySQL local.
 *
 * Estructura real de la base de datos:
 *   CSV "Provincia"    → tabla `provincias`
 *   CSV "Departamento" → tabla `departamento`   (provincia_id)
 *   CSV "Localidad"    → tabla `localidades`     (departamento_id)
 */

const XLSX  = require('xlsx');
const mysql = require('mysql2/promise');

// ── Convierte "GENERAL DONOVAN" en "General Donovan" ──────────────────────
const ARTICULOS = new Set(['de','del','la','las','los','el','y','e','en','a','al','i']);

function toTitleCase(str) {
  return str
    .toLowerCase()
    .split(' ')
    .map((word, i) => (i === 0 || !ARTICULOS.has(word))
      ? word.charAt(0).toUpperCase() + word.slice(1)
      : word
    )
    .join(' ');
}

// ── Inserta en lotes para no saturar MySQL ─────────────────────────────────
async function batchInsertIgnore(db, table, columns, rows, batchSize = 300) {
  let total = 0;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch        = rows.slice(i, i + batchSize);
    const placeholders = batch.map(() => `(${columns.map(() => '?').join(',')})`).join(',');
    const values       = batch.flat();
    const [res]        = await db.query(
      `INSERT IGNORE INTO ${table} (${columns.join(',')}) VALUES ${placeholders}`,
      values
    );
    total += res.affectedRows;
    process.stdout.write(`\r   Progreso: ${Math.min(i + batchSize, rows.length)} / ${rows.length}`);
  }
  console.log(`\r   Insertados: ${total} nuevos (de ${rows.length} únicos en CSV)   `);
}

async function main() {
  // ── 1. Leer Excel ──────────────────────────────────────────────────────
  console.log('\n📖 Leyendo archivo Excel...');
  const wb   = XLSX.readFile('database/datos.csv.xlsx');
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '' });
  console.log(`   ${rows.length} filas encontradas.`);

  // ── 2. Conectar a MySQL ────────────────────────────────────────────────
  const db = await mysql.createConnection({
    host: 'localhost', user: 'root', password: '', database: 'mi_directorio',
  });
  console.log('✅ Conectado a MySQL.\n');

  // ── 3. PROVINCIAS ──────────────────────────────────────────────────────
  // Cargar las que ya existen en un mapa UPPERCASE → id
  const [provExistentes] = await db.query('SELECT id, nombre FROM provincias');
  const provinciaMap = new Map();
  for (const row of provExistentes) {
    provinciaMap.set(row.nombre.toUpperCase(), row.id);
  }

  // Provincias del CSV que NO están todavía en la BD
  const provinciasCSV   = [...new Set(rows.map(r => r.Provincia))];
  const provinciasNuevas = provinciasCSV
    .filter(p => !provinciaMap.has(p.toUpperCase()))
    .map(p => [toTitleCase(p)]);

  console.log(`📍 Provincias en CSV: ${provinciasCSV.length}  |  Nuevas a insertar: ${provinciasNuevas.length}`);
  if (provinciasNuevas.length > 0) {
    await batchInsertIgnore(db, 'provincias', ['nombre'], provinciasNuevas);
  }

  // Recargar mapa con los ids definitivos
  const [provFinal] = await db.query('SELECT id, nombre FROM provincias');
  for (const row of provFinal) {
    provinciaMap.set(row.nombre.toUpperCase(), row.id);
  }
  // Guardar también la clave exacta del CSV (ej. "TIERRA DEL FUEGO, ANTÁRTIDA...")
  for (const csvProv of provinciasCSV) {
    const id = provinciaMap.get(toTitleCase(csvProv).toUpperCase())
            ?? provinciaMap.get(csvProv.toUpperCase());
    if (id) provinciaMap.set(csvProv, id);
  }

  // ── 4. DEPARTAMENTOS → tabla `departamento` ────────────────────────────
  const deptosUnicos = new Map(); // "DEPTO||PROV_CSV" → [nombre_tc, provincia_id]
  let sinProv = 0;
  for (const row of rows) {
    const key = `${row.Departamento}||${row.Provincia}`;
    if (deptosUnicos.has(key)) continue;
    const provId = provinciaMap.get(row.Provincia);
    if (!provId) { sinProv++; continue; }
    deptosUnicos.set(key, [toTitleCase(row.Departamento), provId]);
  }

  console.log(`\n🏘️  Departamentos únicos: ${deptosUnicos.size}`);
  if (sinProv > 0) console.warn(`   ⚠️  ${sinProv} filas con provincia no encontrada (saltadas).`);
  await batchInsertIgnore(db, 'departamento', ['nombre', 'provincia_id'], [...deptosUnicos.values()]);

  // Construir mapa departamento: "NOMBRE_UPPER||prov_id" → id
  const [deptoFinal] = await db.query('SELECT id, nombre, provincia_id FROM departamento');
  const deptoMap = new Map();
  for (const row of deptoFinal) {
    deptoMap.set(`${row.nombre.toUpperCase()}||${row.provincia_id}`, row.id);
  }
  console.log(`   Mapa de departamentos construido (${deptoMap.size} entradas).`);

  // ── 5. LOCALIDADES → tabla `localidades` ──────────────────────────────
  const locUnicos = new Map(); // "LOC||DEPTO||PROV" → [nombre_tc, departamento_id]
  let sinDepto = 0;
  for (const row of rows) {
    const key = `${row.Localidad}||${row.Departamento}||${row.Provincia}`;
    if (locUnicos.has(key)) continue;
    const provId   = provinciaMap.get(row.Provincia);
    const deptoKey = `${toTitleCase(row.Departamento).toUpperCase()}||${provId}`;
    const deptoId  = deptoMap.get(deptoKey);
    if (!deptoId) { sinDepto++; continue; }
    locUnicos.set(key, [toTitleCase(row.Localidad), deptoId]);
  }

  console.log(`\n🏙️  Localidades únicas: ${locUnicos.size}`);
  if (sinDepto > 0) console.warn(`   ⚠️  ${sinDepto} filas con departamento no encontrado (saltadas).`);
  await batchInsertIgnore(db, 'localidades', ['nombre', 'departamento_id'], [...locUnicos.values()]);

  // ── 6. Resumen final ───────────────────────────────────────────────────
  const [[{ total: tProv }]] = await db.query('SELECT COUNT(*) as total FROM provincias');
  const [[{ total: tDep }]]  = await db.query('SELECT COUNT(*) as total FROM departamento');
  const [[{ total: tLoc }]]  = await db.query('SELECT COUNT(*) as total FROM localidades');

  console.log('\n✅ ¡Importación completada!');
  console.log(`   Provincias             : ${tProv}`);
  console.log(`   Departamentos          : ${tDep}`);
  console.log(`   Localidades            : ${tLoc}`);

  await db.end();
}

main().catch(err => {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
});
