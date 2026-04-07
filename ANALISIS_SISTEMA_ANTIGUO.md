# 🔍 Análisis Profundo del Sistema Antiguo - Lógica Académica

## 📊 Estructura de Base de Datos

### 1. Tabla: `niveles_educativos`
```sql
CREATE TABLE `niveles_educativos` (
  `nivel_id` int NOT NULL AUTO_INCREMENT,
  `nombre_nivel` varchar(50) NULL DEFAULT NULL,
  `insti_id` int NULL DEFAULT NULL,
  `nivel_estatus` int NULL DEFAULT NULL COMMENT '1: ACTIVO, 0: ELIMINADO',
  PRIMARY KEY (`nivel_id`),
  INDEX `insti_id`(`insti_id`)
)
```

**Propósito:** Define las etapas educativas principales (Inicial, Primaria, Secundaria)

**Campos clave:**
- `nivel_id`: Identificador único
- `nombre_nivel`: Nombre del nivel (ej: "SECUNDARIA", "PRIMARIA")
- `insti_id`: Relación con la institución educativa
- `nivel_estatus`: Estado (1=Activo, 0=Eliminado)

---

### 2. Tabla: `grados`
```sql
CREATE TABLE `grados` (
  `grado_id` int NOT NULL AUTO_INCREMENT,
  `nombre_grado` varchar(200) NULL DEFAULT NULL,
  `abreviatura` varchar(100) NULL DEFAULT NULL,
  `nivel_id` int NULL DEFAULT NULL,
  PRIMARY KEY (`grado_id`),
  INDEX `nivel_id`(`nivel_id`),
  CONSTRAINT `grados_ibfk_1` FOREIGN KEY (`nivel_id`) 
    REFERENCES `niveles_educativos` (`nivel_id`) ON DELETE CASCADE
)
```

**Propósito:** Subdivisiones de cada nivel educativo

**Campos clave:**
- `grado_id`: Identificador único
- `nombre_grado`: Nombre completo (ej: "PRIMER GRADO", "SEGUNDO GRADO")
- `abreviatura`: Forma corta (ej: "1°", "2°")
- `nivel_id`: FK a `niveles_educativos` (relación padre)

**Relación:** Un nivel tiene muchos grados (1:N)

---

### 3. Tabla: `cursos`
```sql
CREATE TABLE `cursos` (
  `curso_id` int NOT NULL AUTO_INCREMENT,
  `id_insti` int NULL DEFAULT NULL,
  `nombre` varchar(100) NULL DEFAULT NULL,
  `descripcion` longtext NULL,
  `logo` varchar(200) NULL DEFAULT NULL,
  `nivel_academico_id` int NULL DEFAULT NULL,
  `grado_academico` int NULL DEFAULT NULL,
  PRIMARY KEY (`curso_id`),
  INDEX `nivel_academico_id`(`nivel_academico_id`),
  CONSTRAINT `cursos_ibfk_2` FOREIGN KEY (`nivel_academico_id`) 
    REFERENCES `niveles_educativos` (`nivel_id`) ON DELETE CASCADE
)
```

**Propósito:** Pool de materias/asignaturas por nivel educativo

**Campos clave:**
- `curso_id`: Identificador único
- `nombre`: Nombre del curso (ej: "MATEMÁTICA", "COMUNICACIÓN")
- `descripcion`: Descripción detallada
- `logo`: Ruta de imagen del curso
- `nivel_academico_id`: FK a `niveles_educativos` (PRINCIPAL)
- `grado_academico`: Campo opcional, puede ser NULL

**Observación crítica:** 
- Los cursos pertenecen PRINCIPALMENTE al nivel
- El campo `grado_academico` es opcional y puede ser NULL
- Esto permite un "pool" de cursos por nivel

---

### 4. Tabla: `grados_cursos` (Tabla Pivote)
```sql
CREATE TABLE `grados_cursos` (
  `grac_id` int NOT NULL AUTO_INCREMENT,
  `id_grado` int NULL DEFAULT NULL,
  `id_curso` int NULL DEFAULT NULL,
  `grac_estado` int NULL DEFAULT NULL COMMENT '1: ACTIVO, 0: ELIMINADO',
  PRIMARY KEY (`grac_id`),
  INDEX `id_grado`(`id_grado`),
  CONSTRAINT `grados_cursos_ibfk_1` FOREIGN KEY (`id_grado`) 
    REFERENCES `grados` (`grado_id`) ON DELETE CASCADE
)
```

**Propósito:** Asignación de cursos específicos a grados

**Campos clave:**
- `grac_id`: Identificador único
- `id_grado`: FK a `grados`
- `id_curso`: FK a `cursos`
- `grac_estado`: Estado de la asignación (1=Activo, 0=Eliminado)

**Lógica:** 
- Permite asignar cursos del pool del nivel a grados específicos
- Relación muchos a muchos entre grados y cursos
- Un grado puede tener múltiples cursos
- Un curso puede estar en múltiples grados

---

### 5. Tabla: `secciones`
```sql
CREATE TABLE `secciones` (
  `seccion_id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NULL DEFAULT NULL,
  `abreviatura` varchar(5) NULL DEFAULT NULL,
  `cnt_alumnos` int NULL DEFAULT NULL,
  `id_grado` int NULL DEFAULT NULL,
  `horario` varchar(255) NULL DEFAULT NULL,
  PRIMARY KEY (`seccion_id`),
  INDEX `id_grado`(`id_grado`),
  CONSTRAINT `secciones_ibfk_1` FOREIGN KEY (`id_grado`) 
    REFERENCES `grados` (`grado_id`) ON DELETE CASCADE
)
```

**Propósito:** División física de estudiantes dentro de un grado

**Campos clave:**
- `seccion_id`: Identificador único
- `nombre`: Nombre de la sección (ej: "SECCIÓN A", "SECCIÓN B")
- `abreviatura`: Forma corta (ej: "A", "B")
- `cnt_alumnos`: Contador de alumnos
- `id_grado`: FK a `grados` (relación padre)
- `horario`: Información del horario

**Relación:** Un grado tiene muchas secciones (1:N)

---

## 🔄 Flujo de Trabajo del Sistema Antiguo

### Módulo: Niveles Educativos (menu=2)

**Ubicación:** `admin/views/Nivel/V_Nivel.php`

**Tabla mostrada:**
```
| # | NOMBRE | [Icono] | GRADOS | CURSOS | EDITAR |
```

**Botones de acción:**
1. **GRADOS**: Muestra los grados asociados al nivel
2. **CURSOS**: Muestra el pool de cursos del nivel

---

### Flujo: Gestión de Cursos desde Niveles

**Archivo:** `admin/functions/Nivel/Nivel.php`

#### Caso 5: Consultar Cursos de un Nivel
```php
case '5':
    $idnil = $_POST['idniv'];
    $ntipo = $_POST['ntipo'];
    if ($ntipo == 'cursos') {
        $sql = "SELECT * FROM cursos WHERE nivel_academico_id='$idnil'";
    }
```

**Lógica:**
- Se consultan TODOS los cursos donde `nivel_academico_id` = nivel seleccionado
- NO se filtra por grado
- Muestra el "pool completo" de cursos del nivel

#### Caso 10: Agregar Curso
```php
case '10':
    $idniv = $_POST['idniv'];
    $curnom = $_POST['curnom'];
    $curdesc = $_POST['curdesc'];
    // Manejo de imagen...
    $sql2 = "INSERT INTO cursos VALUES 
        ('0','8',UPPER('$curnom'),UPPER('$curdesc'),'$nomfoto','$idniv',null)";
```

**Observaciones:**
- El curso se crea con `nivel_academico_id` = nivel actual
- El campo `grado_academico` se inserta como `null`
- La imagen se guarda en: `images/Institucion/Cursos/`
- Nombre de archivo: `{nombre_curso}_{nivel_id}.{extension}`

#### Caso 8: Editar Curso
```php
case '8':
    $idcurb = $_POST['idcurb'];
    $bcurnom = $_POST['bcurnom'];
    $bcurdesc = $_POST['bcurdesc'];
    // Actualiza nombre, descripción y opcionalmente logo
    $sql2 = "UPDATE cursos SET 
        nombre =UPPER('$bcurnom'), 
        descripcion =UPPER('$bcurdesc'), 
        logo ='$nomfoto' 
        WHERE curso_id='$idcurb'";
```

---

### Módulo: Grados (menu=9)

**Ubicación:** `admin/views/Grados/V_Grados.php`

**Tabla mostrada:**
```
| # | NIVEL ACADEMICO | GRADO | ABREVIATURA | [Icono] | CURSOS | EDITAR |
```

**SQL de consulta:**
```php
$sql = "SELECT g.nombre_grado, g.abreviatura, g.grado_id, 
               n.nivel_id, n.nombre_nivel 
        FROM grados g, niveles_educativos n
        WHERE n.nivel_id = g.nivel_id";
```

---

### Flujo: Asignación de Cursos a Grados

**Archivo:** `admin/functions/Grados/Grados.php`

#### Caso 4: Ver Cursos Asignados a un Grado
```php
case '4':
    $graid = $_POST['graid'];
    $sql = "SELECT g.grac_id, g.id_curso, c.nombre, c.descripcion
            FROM grados_cursos g, cursos c
            WHERE c.curso_id = g.id_curso 
              AND g.id_grado ='$graid' 
              AND g.grac_estado='1'";
```

**Lógica:**
- Consulta la tabla pivote `grados_cursos`
- Muestra solo cursos activos (`grac_estado='1'`)
- Join con tabla `cursos` para obtener detalles

#### Caso 5: Asignar Curso a Grado
```php
case '5':
    $cur_id = $_POST['cur_id'];
    $graid = $_POST['graid'];
    $sql2 = "INSERT INTO grados_cursos VALUES ('0','$graid','$cur_id','1')";
```

**Lógica:**
- Crea registro en tabla pivote
- Estado inicial: activo (`grac_estado='1'`)

#### Caso 7: Eliminar Curso de Grado (Soft Delete)
```php
case '7':
    $ebid = $_POST['ebid'];
    $sql0 = "UPDATE grados_cursos SET grac_estado='0' WHERE grac_id='$ebid'";
```

**Lógica:**
- NO elimina el registro
- Cambia estado a inactivo (`grac_estado='0'`)
- Permite recuperación posterior

---

## 🎯 Conclusiones del Análisis

### Jerarquía Real del Sistema:

```
INSTITUCIÓN EDUCATIVA
    └── NIVELES EDUCATIVOS (Inicial, Primaria, Secundaria)
            ├── CURSOS (Pool de materias del nivel)
            │     └── Asignación opcional a grados vía tabla pivote
            └── GRADOS (1°, 2°, 3°, etc.)
                    └── SECCIONES (A, B, C, etc.)
```

### Flujo de Navegación Original:

1. **Entrada:** Módulo "Niveles Educativos"
2. **Acción:** Click en botón "CURSOS" de un nivel
3. **Resultado:** Modal/Vista con lista de cursos del nivel
4. **Operaciones:** 
   - Crear nuevo curso (sin obligar a elegir grado)
   - Editar curso existente
   - Ver/Eliminar cursos

5. **Entrada alternativa:** Módulo "Grados"
6. **Acción:** Click en botón "CURSOS" de un grado
7. **Resultado:** Modal con cursos asignados específicamente a ese grado
8. **Operaciones:**
   - Asignar cursos del pool del nivel
   - Desasignar cursos del grado

### Diferencias con el Sistema Nuevo:

#### ❌ Problema Actual:
- Los cursos están fuertemente acoplados a grados
- No existe el concepto de "pool de cursos por nivel"
- La navegación no replica el flujo original

#### ✅ Solución Requerida:
- Implementar tabla pivote `grados_cursos` en Laravel
- Modificar modelo `Curso` para permitir `grado_id` NULL
- Crear vista de cursos filtrada por nivel (no por grado)
- Agregar funcionalidad de asignación de cursos a grados

---

## 📝 Recomendaciones para Migración

### 1. Modificar Migraciones
```php
// En migration de cursos:
$table->foreignId('nivel_academico_id')->constrained('niveles_educativos');
$table->foreignId('grado_academico')->nullable()->constrained('grados');
```

### 2. Crear Tabla Pivote
```php
Schema::create('grados_cursos', function (Blueprint $table) {
    $table->id('grac_id');
    $table->foreignId('id_grado')->constrained('grados')->onDelete('cascade');
    $table->foreignId('id_curso')->constrained('cursos')->onDelete('cascade');
    $table->tinyInteger('grac_estado')->default(1);
    $table->timestamps();
});
```

### 3. Actualizar Modelos
```php
// Modelo Curso
public function nivel() {
    return $this->belongsTo(NivelEducativo::class, 'nivel_academico_id');
}

public function grados() {
    return $this->belongsToMany(Grado::class, 'grados_cursos', 'id_curso', 'id_grado')
                ->withPivot('grac_estado')
                ->wherePivot('grac_estado', 1);
}

// Modelo Grado
public function cursos() {
    return $this->belongsToMany(Curso::class, 'grados_cursos', 'id_grado', 'id_curso')
                ->withPivot('grac_estado')
                ->wherePivot('grac_estado', 1);
}
```

### 4. Rutas Necesarias
```php
// Cursos por nivel (pool)
Route::get('/niveles/{nivel}/cursos', [CursoController::class, 'porNivel']);

// Cursos asignados a grado
Route::get('/grados/{grado}/cursos', [GradoController::class, 'cursosAsignados']);

// Asignar/Desasignar curso a grado
Route::post('/grados/{grado}/cursos/{curso}/asignar', [GradoController::class, 'asignarCurso']);
Route::delete('/grados/{grado}/cursos/{curso}/desasignar', [GradoController::class, 'desasignarCurso']);
```

---

**Fecha de análisis:** 2026-04-07  
**Sistema analizado:** bautistalapascana (Sistema antiguo PHP)  
**Sistema destino:** bautista (Laravel + React)


---

## 🖥️ Lógica del Frontend (JavaScript/jQuery)

### Archivo: `admin/functions/Nivel/Nivel.js`

#### Flujo de Interacción del Usuario:

```javascript
// 1. VISTA PRINCIPAL: Tabla de Niveles
// Columnas: # | NOMBRE | [X] | GRADOS | CURSOS | EDITAR
tablenivel = $('#tablenivel').DataTable({
    "columns":[
        {"data": "nivel_id"},
        {"data": "nombre_nivel"},
        {"data": "nivel_id"},  // Botón eliminar
        {"defaultContent": "btnGrad"},  // Botón GRADOS
        {"defaultContent": "btnCur"},   // Botón CURSOS
        {"defaultContent": "btnEdit"}   // Botón EDITAR
    ]
});
```

#### Evento: Click en Botón "GRADOS"
```javascript
$(document).on("click", ".btnGrad", function(){
    fila = $(this).closest("tr");
    idniv = fila.find('td:eq(0)').text();  // Captura nivel_id
    ninom = fila.find('td:eq(1)').text();  // Captura nombre_nivel
    
    $("#principal").hide();  // Oculta tabla principal
    
    // Carga vista de detalles con parámetros
    $('#opciones').load('views/Nivel/V_Detalles.php', { 
        "form": "grado",      // Tipo: grado
        "idniv": idniv,       // ID del nivel
        "ninom": ninom        // Nombre del nivel
    });
});
```

#### Evento: Click en Botón "CURSOS"
```javascript
$(document).on("click", ".btnCur", function(){
    fila = $(this).closest("tr");
    idniv = fila.find('td:eq(0)').text();  // Captura nivel_id
    ninom = fila.find('td:eq(1)').text();  // Captura nombre_nivel
    
    $("#principal").hide();  // Oculta tabla principal
    
    // Carga vista de detalles con parámetros
    $('#opciones').load('views/Nivel/V_Detalles.php', { 
        "form": "cursos",     // Tipo: cursos
        "idniv": idniv,       // ID del nivel
        "ninom": ninom        // Nombre del nivel
    });
});
```

---

### Archivo: `admin/views/Nivel/V_Detalles.php`

#### Lógica de Vista Dinámica:

```php
<?php
$form = $_POST['form'];  // 'grado' o 'cursos'
$idniv = $_POST['idniv'];
$ninom = $_POST['ninom'];

// Determina el título según el tipo
if ($form == 'grado') {
    $tituldet = "Grados";
} else {
    $tituldet = "Cursos";
}
?>

<!-- Header dinámico -->
<h2>
    <i class="fa fa-mortar-board"></i>&nbsp;
    <?=$tituldet; ?>  <!-- "Grados" o "Cursos" -->
    <small><?=$ninom; ?></small>  <!-- Nombre del nivel -->
</h2>

<!-- Botones de acción -->
<a class="btn btn-success" id="btnNuev">
    <i class="fa fa-plus"></i> Agregar
</a>
<a class="btn btn-warning" id="btnRegre">
    <i class="glyphicon glyphicon-chevron-left"></i>  <!-- Regresar -->
</a>

<!-- Tabla dinámica según tipo -->
<table id="tablegrado">
    <thead>
        <?php if ($form == 'grado'): ?>
            <tr>
                <th>#</th>
                <th>GRADO</th>
                <th>ABREVIATURA</th>
                <th>EDITAR</th>
            </tr>
        <?php else: ?>
            <tr>
                <th>#</th>
                <th>CURSO</th>
                <th>DESCRIPCION</th>
                <th>EDITAR</th>
            </tr>
        <?php endif; ?>
    </thead>
</table>

<!-- Campos ocultos para JavaScript -->
<input type="hidden" id="idniv" value="<?=$idniv; ?>">
<input type="hidden" id="ntipo" value="<?=$form; ?>">
```

#### JavaScript Embebido en V_Detalles.php:

```javascript
$(document).ready(function() {
    var idniv = $.trim($('#idniv').val());  // ID del nivel
    var ntipo = $.trim($('#ntipo').val());  // 'grado' o 'cursos'
    
    // Función para cargar datos según tipo
    function lista_grado() {
        opcion = 5;  // Opción 5 en PHP: Consultar
        
        if (ntipo == 'cursos') {
            // Carga cursos del nivel
            tablegrado = $('#tablegrado').DataTable({
                "ajax": {
                    "url": "functions/Nivel/Nivel.php",
                    "method": 'POST',
                    "data": {
                        opcion: opcion,
                        idniv: idniv,      // Filtra por nivel
                        ntipo: ntipo       // Tipo: cursos
                    },
                    "dataSrc": ""
                },
                "columns": [
                    {"data": "curso_id"},
                    {"data": "nombre"},
                    {"data": "descripcion"},
                    {"defaultContent": "btnEditg"}
                ]
            });
        }
        
        if (ntipo == 'grado') {
            // Carga grados del nivel
            tablegrado = $('#tablegrado').DataTable({
                "ajax": {
                    "url": "functions/Nivel/Nivel.php",
                    "method": 'POST',
                    "data": {
                        opcion: opcion,
                        idniv: idniv,      // Filtra por nivel
                        ntipo: ntipo       // Tipo: grado
                    },
                    "dataSrc": ""
                },
                "columns": [
                    {"data": "grado_id"},
                    {"data": "nombre_grado"},
                    {"data": "abreviatura"},
                    {"defaultContent": "btnEditg"}
                ]
            });
        }
    }
    
    lista_grado();  // Carga inicial
    
    // Botón "Agregar"
    $("#btnNuev").click(function() {
        if (ntipo == 'grado') {
            $("#formGrado").trigger("reset");
            $('#M_Grado').modal('show');  // Modal de grado
        }
        if (ntipo == 'cursos') {
            $("#formCurso").trigger("reset");
            $('#M_Curso').modal('show');  // Modal de curso
        }
    });
    
    // Botón "Regresar"
    $("#btnRegre").click(function() {
        $('#detalle').hide();      // Oculta vista de detalles
        $('#principal').show();    // Muestra tabla principal
    });
    
    // Agregar Curso (con imagen)
    $("#formCurso").submit(function(e) {
        e.preventDefault();
        opcion = 10;  // Opción 10 en PHP: Agregar curso
        
        var formData = new FormData();
        formData.append('file', $('#uploadImage1')[0].files[0]);
        formData.append('idniv', idniv);  // ID del nivel
        formData.append('curnom', $.trim($('#curnom').val()));
        formData.append('curdesc', $.trim($('#curdesc').val()));
        formData.append('opcion', opcion);
        formData.append('action', 'upload');
        
        $.ajax({
            url: "functions/Nivel/Nivel.php",
            type: "POST",
            data: formData,
            contentType: false,
            processData: false,
            success: function(data) {
                lista_grado();  // Recarga tabla
                toastr.success('Curso agregado correctamente');
            }
        });
        
        $('#M_Curso').modal('hide');
    });
    
    // Editar Curso
    $(document).on("click", ".btnEditg", function() {
        if (ntipo == 'cursos') {
            fila = $(this).closest("tr");
            idcur = fila.find('td:eq(0)').text();
            curnomb = fila.find('td:eq(1)').text();
            curdesc = fila.find('td:eq(2)').text();
            
            $("#idcurb").val(idcur);
            $("#bcurnom").val(curnomb);
            $("#bcurdesc").val(curdesc);
            
            // Cargar imagen actual
            opcion = 11;  // Opción 11: Obtener logo del curso
            $.ajax({
                url: "functions/Nivel/Nivel.php",
                type: "POST",
                data: {opcion: opcion, idcur: idcur},
                success: function(data) {
                    let ObjetoJSS = JSON.parse(data);
                    var logo = ObjetoJSS[0].logo2;
                    
                    if (logo != '0') {
                        $(".cargaim").attr("src", 
                            "../images/Institucion/Cursos/" + logo);
                    } else {
                        $(".cargaim").attr("src", 
                            "../images/Institucion/noimage.png");
                    }
                }
            });
            
            $('#E_Curso').modal('show');
        }
    });
});
```

---

## 🎨 Modales del Sistema Antiguo

### Modal: Agregar Curso (`M_Curso.php`)

**Estructura esperada:**
```html
<div class="modal" id="M_Curso">
    <form id="formCurso" enctype="multipart/form-data">
        <input type="hidden" id="action" value="upload">
        
        <!-- Layout: 2 columnas -->
        <div class="row">
            <!-- Columna izquierda: Imagen -->
            <div class="col-md-4">
                <label>Logo del Curso</label>
                <input type="file" id="uploadImage1" name="file">
                <img class="preview" src="noimage.png">
            </div>
            
            <!-- Columna derecha: Formulario -->
            <div class="col-md-8">
                <div class="form-group">
                    <label>Nivel Educativo</label>
                    <input type="text" readonly value="[Nivel actual]">
                </div>
                
                <div class="form-group">
                    <label>Nombre del Curso</label>
                    <input type="text" id="curnom" required>
                </div>
                
                <div class="form-group">
                    <label>Descripción</label>
                    <textarea id="curdesc"></textarea>
                </div>
            </div>
        </div>
        
        <button type="submit">Guardar</button>
    </form>
</div>
```

**Características clave:**
- Layout de 2 columnas (imagen izquierda, formulario derecha)
- Campo de nivel BLOQUEADO (readonly) con el nivel actual
- Campo de nombre es INPUT de texto libre (NO selector)
- Carga de imagen opcional
- Sin campo de grado (se asigna después si es necesario)

### Modal: Editar Curso (`E_Curso.php`)

**Diferencias con el modal de agregar:**
- Muestra la imagen actual del curso
- Permite cambiar la imagen (opcional)
- Pre-carga los datos existentes
- Mismo layout de 2 columnas

---

## 📋 Resumen del Flujo Completo

### Escenario 1: Gestionar Cursos desde Niveles

```
1. Usuario ve tabla de Niveles
   └─> Columnas: # | NOMBRE | [X] | GRADOS | CURSOS | EDITAR

2. Usuario hace clic en botón "CURSOS" de un nivel
   └─> JavaScript captura: nivel_id, nombre_nivel
   └─> Oculta tabla principal
   └─> Carga V_Detalles.php con parámetros:
       - form: "cursos"
       - idniv: [ID del nivel]
       - ninom: [Nombre del nivel]

3. V_Detalles.php renderiza:
   └─> Header: "Cursos - [Nombre del Nivel]"
   └─> Botón: "Agregar"
   └─> Botón: "Regresar"
   └─> Tabla con cursos del nivel

4. JavaScript carga datos:
   └─> AJAX a Nivel.php con opcion=5
   └─> Parámetros: idniv=[ID], ntipo="cursos"
   └─> PHP ejecuta: SELECT * FROM cursos WHERE nivel_academico_id='[ID]'
   └─> Retorna JSON con cursos
   └─> DataTable muestra: ID | NOMBRE | DESCRIPCION | EDITAR

5. Usuario hace clic en "Agregar":
   └─> Abre modal M_Curso.php
   └─> Layout: 2 columnas (imagen | formulario)
   └─> Campos: Nivel (bloqueado), Nombre (input libre), Descripción
   └─> Usuario llena formulario y sube imagen (opcional)
   └─> Submit envía FormData a Nivel.php con opcion=10
   └─> PHP inserta: INSERT INTO cursos (..., nivel_academico_id='[ID]', grado_academico=null)
   └─> Imagen se guarda en: images/Institucion/Cursos/[nombre]_[nivel_id].[ext]
   └─> Tabla se recarga automáticamente

6. Usuario hace clic en "Editar" de un curso:
   └─> JavaScript captura datos de la fila
   └─> AJAX a Nivel.php con opcion=11 para obtener logo actual
   └─> Abre modal E_Curso.php con datos pre-cargados
   └─> Usuario modifica y guarda
   └─> Submit envía FormData a Nivel.php con opcion=8
   └─> PHP actualiza: UPDATE cursos SET ... WHERE curso_id='[ID]'
   └─> Tabla se recarga

7. Usuario hace clic en "Regresar":
   └─> Oculta vista de detalles
   └─> Muestra tabla principal de niveles
```

### Escenario 2: Gestionar Grados desde Niveles

```
1. Usuario hace clic en botón "GRADOS" de un nivel
   └─> Mismo flujo que cursos pero con form="grado"
   └─> Tabla muestra: ID | GRADO | ABREVIATURA | EDITAR
   └─> Modal más simple (sin imagen, solo nombre y abreviatura)
```

---

## 🔑 Puntos Críticos para la Migración

### 1. Navegación Contextual
- El sistema antiguo usa carga dinámica de vistas (AJAX)
- Oculta/muestra divs en lugar de cambiar de página
- El contexto del nivel se mantiene en campos ocultos

**Solución en React/Inertia:**
- Usar parámetros de URL: `/niveles/{nivel_id}/cursos`
- O usar estado local con componentes condicionales
- Mantener el nivel_id en el estado del componente

### 2. Modal de Curso con Imagen
- Layout específico de 2 columnas
- Preview de imagen en tiempo real
- Campo de nivel bloqueado pero visible

**Solución en React:**
- Componente FormSection con grid de 2 columnas
- Hook para preview de imagen
- Input readonly con valor del nivel

### 3. Tabla Dinámica según Contexto
- Misma tabla (#tablegrado) para grados y cursos
- Columnas cambian según el tipo
- DataTable se destruye y recrea

**Solución en React:**
- Componente ResourceTable con columnas dinámicas
- Props condicionales según el tipo
- useEffect para recargar datos

### 4. Botón "Regresar"
- Vuelve a la vista principal
- No recarga la página
- Mantiene el estado de la tabla principal

**Solución en React:**
- Usar router.back() de Inertia
- O estado condicional para mostrar/ocultar vistas
- Preservar filtros y paginación

---

## ✅ Checklist de Implementación

- [ ] Crear tabla pivote `grados_cursos` en Laravel
- [ ] Modificar modelo `Curso` para permitir `grado_id` NULL
- [ ] Agregar relación `belongsToMany` entre Grado y Curso
- [ ] Crear ruta `/niveles/{nivel}/cursos`
- [ ] Crear componente `CursosDelNivel.tsx`
- [ ] Modificar `CursoFormModal` para layout de 2 columnas
- [ ] Agregar campo de nivel bloqueado en modal
- [ ] Implementar preview de imagen en modal
- [ ] Crear endpoint API para cursos por nivel
- [ ] Crear endpoint API para asignar/desasignar cursos a grados
- [ ] Agregar botón "Gestionar Cursos" en tabla de niveles
- [ ] Implementar navegación contextual (nivel → cursos)
- [ ] Agregar botón "Regresar" en vista de cursos
- [ ] Probar flujo completo: Nivel → Cursos → Agregar → Editar → Regresar

---

**Última actualización:** 2026-04-07  
**Análisis completado por:** Kiro AI Assistant  
**Estado:** ✅ Documentación completa con frontend y backend
