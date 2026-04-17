<?php
/**
 * Script de prueba: crea alumno + padre + madre y los matricula
 * en 1RO SECUNDARIA - UNICA (apertura_id=9, seccion_id=146, anio=2026)
 *
 * Uso: php tes_crear.php
 */

// ── Configuración ─────────────────────────────────────────────────────────────
define('BASE_URL',    'http://localhost:8000/api');
define('ADMIN_USER',  'admin');
define('ADMIN_PASS',  'admin123');         // cambiar si la contraseña es diferente

// IDs fijos (obtenidos de la BD)
define('APERTURA_ID', 9);
define('SECCION_ID',  146);   // UNICA - 1RO SECUNDARIA
define('ANIO',        2026);

// Datos únicos basados en timestamp para evitar duplicados
$ts = substr(time(), -7);

$alumno = [
    'username'         => '8' . $ts,
    'primer_nombre'    => 'DIEGO',
    'segundo_nombre'   => 'ALEJANDRO',
    'apellido_paterno' => 'MENDOZA',
    'apellido_materno' => 'SILVA',
    'genero'           => 'M',
    'fecha_nacimiento' => '2011-08-15',
    'edad'             => 14,
    'direccion'        => 'JR. LAS FLORES 789, LA PASCANA',
    'telefono'         => '988' . $ts,
    'colegio'          => 'COLEGIO PRIMARIA SAN JOSE',
    'mensualidad'      => '320.00',
    'fecha_ingreso'    => '2026-03-01',
    'fecha_pago'       => '2026-03-05',
];

$padre = [
    'parentesco'     => 'padre',
    'nombres'        => 'ROBERTO MANUEL',
    'apellidos'      => 'MENDOZA CASTRO',
    'numero_doc'     => '5' . $ts . '3',
    'tipo_doc'       => 1,
    'genero'         => 'M',
    'telefono_1'     => '993' . $ts,
    'email_contacto' => 'padre_' . $ts . '@test.com',
    'direccion'      => 'JR. LAS FLORES 789, LA PASCANA',
    'estado_civil'   => 'Casado',
    'es_pagador'     => 'si',
];

$madre = [
    'parentesco'     => 'madre',
    'nombres'        => 'PATRICIA ELENA',
    'apellidos'      => 'SILVA ROJAS',
    'numero_doc'     => '7' . $ts . '4',
    'tipo_doc'       => 1,
    'genero'         => 'F',
    'telefono_1'     => '994' . $ts,
    'email_contacto' => 'madre_' . $ts . '@test.com',
    'direccion'      => 'JR. LAS FLORES 789, LA PASCANA',
    'estado_civil'   => 'Casada',
    'es_pagador'     => 'no',
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function log_step(string $t): void { echo "\n" . str_repeat('-', 58) . "\n  {$t}\n" . str_repeat('-', 58) . "\n"; }
function log_ok(string $m): void   { echo "  OK  {$m}\n"; }
function log_err(string $m): void  { echo "  ERR {$m}\n"; }
function log_info(string $m): void { echo "      {$m}\n"; }

function api(string $method, string $path, array $data = [], string $token = ''): array {
    $ch = curl_init(BASE_URL . $path);
    $headers = ['Content-Type: application/json', 'Accept: application/json'];
    if ($token) $headers[] = "Authorization: Bearer {$token}";
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST  => strtoupper($method),
        CURLOPT_HTTPHEADER     => $headers,
        CURLOPT_POSTFIELDS     => $data ? json_encode($data) : null,
        CURLOPT_TIMEOUT        => 15,
    ]);
    $body   = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    $decoded = json_decode($body, true) ?? ['_raw' => $body];
    $decoded['_status'] = $status;
    return $decoded;
}

// ── PASO 1: Login ─────────────────────────────────────────────────────────────
log_step('PASO 1 — Login como administrador');

$login = api('POST', '/auth/login', ['username' => ADMIN_USER, 'password' => ADMIN_PASS, 'device_name' => 'test-script']);

if (empty($login['token'])) {
    log_err('No se pudo obtener token. Verifica ADMIN_USER / ADMIN_PASS en este script.');
    log_info(json_encode($login, JSON_UNESCAPED_UNICODE));
    exit(1);
}
$token = $login['token'];
log_ok('Token obtenido. Usuario: ' . ($login['user']['username'] ?? '—'));

// ── PASO 2: Crear alumno ──────────────────────────────────────────────────────
log_step('PASO 2 — Crear alumno');
log_info('Nombre : ' . $alumno['primer_nombre'] . ' ' . $alumno['segundo_nombre'] . ' ' . $alumno['apellido_paterno'] . ' ' . $alumno['apellido_materno']);
log_info('DNI    : ' . $alumno['username']);

$res = api('POST', '/estudiantes', $alumno, $token);

if ($res['_status'] !== 201 || empty($res['data']['estu_id'])) {
    log_err('No se pudo crear el alumno (HTTP ' . $res['_status'] . ')');
    log_info(json_encode($res, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    exit(1);
}

$estuId = $res['data']['estu_id'];
$userId = $res['data']['user']['id'] ?? '—';
log_ok("Alumno creado — estu_id={$estuId}  user_id={$userId}");
log_info("Login alumno: usuario={$alumno['username']}  contrasena={$alumno['username']}");

// ── PASO 3: Crear padre ───────────────────────────────────────────────────────
log_step('PASO 3 — Crear padre');
log_info('Nombre : ' . $padre['nombres'] . ' ' . $padre['apellidos']);
log_info('DNI    : ' . $padre['numero_doc']);

$res = api('POST', "/estudiantes/{$estuId}/contactos", $padre, $token);

if (!empty($res['ok'])) {
    log_ok('Padre creado — id_contacto=' . ($res['id_contacto'] ?? '—'));
    log_info("Login padre: usuario={$padre['numero_doc']}  contrasena={$padre['numero_doc']}");
} else {
    log_err('No se pudo crear el padre (HTTP ' . $res['_status'] . ')');
    log_info(json_encode($res, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
}

// ── PASO 4: Crear madre ───────────────────────────────────────────────────────
log_step('PASO 4 — Crear madre');
log_info('Nombre : ' . $madre['nombres'] . ' ' . $madre['apellidos']);
log_info('DNI    : ' . $madre['numero_doc']);

$res = api('POST', "/estudiantes/{$estuId}/contactos", $madre, $token);

if (!empty($res['ok'])) {
    log_ok('Madre creada — id_contacto=' . ($res['id_contacto'] ?? '—'));
    log_info("Login madre: usuario={$madre['numero_doc']}  contrasena={$madre['numero_doc']}");
} else {
    log_err('No se pudo crear la madre (HTTP ' . $res['_status'] . ')');
    log_info(json_encode($res, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
}

// ── PASO 5: Matricular ────────────────────────────────────────────────────────
log_step('PASO 5 — Matricular en 1RO SECUNDARIA - UNICA');
log_info('apertura_id=' . APERTURA_ID . '  seccion_id=' . SECCION_ID . '  anio=' . ANIO);

$res = api('POST', '/matriculas', [
    'apertura_id' => APERTURA_ID,
    'estu_id'     => $estuId,
    'seccion_id'  => SECCION_ID,
    'anio'        => ANIO,
], $token);

if ($res['_status'] !== 201 || empty($res['data']['matricula_id'])) {
    log_err('No se pudo matricular (HTTP ' . $res['_status'] . ')');
    log_info(json_encode($res, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    exit(1);
}

$matriculaId = $res['data']['matricula_id'];
log_ok("Matriculado — matricula_id={$matriculaId}");

// ── Resumen ───────────────────────────────────────────────────────────────────
echo "\n" . str_repeat('=', 58) . "\n";
echo "  RESUMEN FINAL\n";
echo str_repeat('=', 58) . "\n";
echo "  Alumno   : {$alumno['primer_nombre']} {$alumno['segundo_nombre']} {$alumno['apellido_paterno']} {$alumno['apellido_materno']}\n";
echo "  estu_id  : {$estuId}   matricula_id: {$matriculaId}\n";
echo "  Seccion  : 1RO SECUNDARIA - UNICA (seccion_id=" . SECCION_ID . ")\n";
echo "  Apertura : Matricula 2026 (apertura_id=" . APERTURA_ID . ")\n";
echo "\n";
echo "  CREDENCIALES DE ACCESO:\n";
echo "  Alumno -> usuario: {$alumno['username']}       contrasena: {$alumno['username']}\n";
echo "  Padre  -> usuario: {$padre['numero_doc']}   contrasena: {$padre['numero_doc']}\n";
echo "  Madre  -> usuario: {$madre['numero_doc']}   contrasena: {$madre['numero_doc']}\n";
echo str_repeat('=', 58) . "\n\n";
