# Script de Migración — edu_bautista → edu_bautista2

## Requisitos

```bash
pip install pymysql bcrypt
```

## Uso

```bash
# Simulación (no escribe nada):
python migrate.py --dry-run

# Migración completa:
python migrate.py

# Solo una tabla:
python migrate.py --tabla institucion_educativa
python migrate.py --tabla users
python migrate.py --tabla perfiles
python migrate.py --tabla niveles_educativos
python migrate.py --tabla grados
python migrate.py --tabla secciones
python migrate.py --tabla cursos
python migrate.py --tabla docentes
python migrate.py --tabla estudiantes
python migrate.py --tabla padre_apoderado
python migrate.py --tabla estudiante_contacto
python migrate.py --tabla pagos
```

## Orden de ejecución

```
 1. institucion_educativa   (sin dependencias)
 2. users                   (depende de: institucion_educativa)
 3. perfiles                (depende de: users)
 4. niveles_educativos      (depende de: institucion_educativa)
 5. grados                  (depende de: niveles_educativos)
 6. secciones               (depende de: grados)
 7. cursos                  (depende de: institucion_educativa, niveles_educativos)
 8. docentes                (depende de: users, perfiles, institucion_educativa)
 9. estudiantes             (depende de: users, perfiles, institucion_educativa)
10. padre_apoderado         (depende de: users, institucion_educativa)
11. estudiante_contacto     (depende de: estudiantes, padre_apoderado)
12. pagos                   (depende de: padre_apoderado, estudiantes)
```

## Mapeo de columnas clave

| Tabla        | Columna Antigua        | Columna Nueva     | Nota                        |
|--------------|------------------------|-------------------|-----------------------------|
| usuarios     | `usuario_id`           | `id`              | Auto-increment              |
| usuarios     | `usuario`              | `username`        | Renombrado                  |
| usuarios     | `clave`                | `password`        | Se re-hashea con bcrypt     |
| usuarios     | `fecha_creacion`       | `created_at`      | Renombrado                  |
| usuarios     | `id_rol`               | Spatie roles      | Ver tabla ROL_MAP           |
| perfiles     | `id_usuario`           | `user_id`         | Renombrado                  |
| perfiles     | `doc_id`               | `tipo_doc`        | Renombrado                  |
| perfiles     | `telefono_pricipal`    | `telefono`        | Typo corregido              |
| estudiantes  | `usuario_id`           | `user_id`         | Renombrado                  |

## Mapeo de roles

| ID Antiguo | Nombre Antiguo    | Nombre Nuevo (Spatie) |
|------------|-------------------|-----------------------|
| 1          | ADMINISTRADOR     | administrador         |
| 2          | ESTUDIANTE        | estudiante            |
| 3          | PADRE DE FAMILIA  | padre_familia         |
| 4          | APODERADO         | apoderado             |
| 5          | MADRE DE FAMILIA  | madre_familia         |
| 6          | DOCENTE           | docente               |
| 7          | PSICOLOGO         | psicologo             |

## Contraseñas

Los usuarios migrados tienen como **contraseña su propio DNI** (igual que en el sistema antiguo). El hash bcrypt se genera durante la migración.

## Mapeo clave — módulo de pagos

| Tabla antigua      | Columna antigua    | Tabla nueva          | Columna nueva  | Nota                                      |
|--------------------|--------------------|----------------------|----------------|-------------------------------------------|
| padre_apoderado    | `id_usuario`       | padre_apoderado      | `user_id`      | Renombrado, usa user_id_map               |
| padre_apoderado    | `id_insti`         | padre_apoderado      | `insti_id`     | Renombrado                                |
| padre_apoderado    | `email_concto`     | padre_apoderado      | `email_contacto` | Typo corregido                          |
| padre_apoderado    | `id_rol`, `redes`  | —                    | —              | Ignorados (manejados por Spatie/frontend) |
| estudiante_contacto| `id_estuddiante`   | estudiante_contacto  | `estudiante_id`| Typo corregido en nombre de columna       |
| estudiante_contacto| `id_contacto`      | estudiante_contacto  | `contacto_id`  | Renombrado                                |
| pagos_notifica     | `id_usuario`       | pagos                | `contacto_id`  | Resuelto: `padre_apoderado.id_contacto` WHERE `id_usuario` coincide |
| pagos_notifica     | `id_estudiante`    | pagos                | `estudiante_id`| Renombrado                                |
| pagos_notifica     | `pag_fecha` (varchar) | pagos             | `pag_fecha` (date) | Se toman los primeros 10 chars        |
| pagos_notifica     | `estatus` (varchar)| pagos                | `estatus` (tinyint) | '1'→1, cualquier otro→0              |
| pagos_notifica     | `pag_otro3..5`, `pag_nombre3..4` | —   | —              | Ignorados (nueva tabla solo tiene 2 extras)|

## Tablas NO migradas (legacy)

Las siguientes tablas del sistema antiguo **no se migran** porque pertenecen a módulos no implementados aún en el nuevo sistema:

- Módulo financiero: ventas, caja, productos, etc.
- Exámenes/quizzes: cuestionario, alternativas_pregunta, etc.
- Geolocalización: dir_departamento, dir_provincia, dir_distrito
