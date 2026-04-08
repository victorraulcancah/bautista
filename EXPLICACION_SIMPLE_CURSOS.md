# Explicación Simple: ¿Qué está pasando con los Cursos?

## 🎯 El Problema en Palabras Simples

Imagina que tienes una escuela con 3 niveles: INICIAL, PRIMARIA y SECUNDARIA.

### 📚 Sistema Antiguo (bautistalapascana)

```
INICIAL
├─ MATEMÁTICA
├─ COMUNICACIÓN
└─ CIENCIA

PRIMARIA
├─ MATEMÁTICA
├─ COMUNICACIÓN
└─ CIENCIA

SECUNDARIA
├─ MATEMÁTICA
├─ COMUNICACIÓN
└─ CIENCIA
```

**Cuando haces clic en "Gestión de Cursos" de INICIAL:**
- ✅ Te muestra: MATEMÁTICA, COMUNICACIÓN, CIENCIA (de INICIAL)
- ✅ Título: "Cursos INICIAL"
- ✅ Modal: Ya sabe que estás agregando un curso para INICIAL

---

### 🆕 Sistema Nuevo (bautista)

```
INICIAL
├─ 3 AÑOS
│  ├─ MATEMÁTICA
│  ├─ COMUNICACIÓN
│  └─ CIENCIA
├─ 4 AÑOS
│  ├─ MATEMÁTICA
│  ├─ COMUNICACIÓN
│  └─ CIENCIA
└─ 5 AÑOS
   ├─ MATEMÁTICA
   ├─ COMUNICACIÓN
   └─ CIENCIA

PRIMARIA
├─ 1ER GRADO
│  ├─ MATEMÁTICA
│  └─ ...
├─ 2DO GRADO
│  ├─ MATEMÁTICA
│  └─ ...
└─ ... (hasta 6TO GRADO)

SECUNDARIA
├─ 1RO SECUNDARIA
├─ 2DO SECUNDARIA
└─ ... (hasta 5TO)
```

**Cuando haces clic en "Gestión de Cursos" de INICIAL:**
- ❌ Te muestra: TODOS los grados de TODOS los niveles (3 AÑOS, 4 AÑOS, 5 AÑOS, 1ER GRADO, 2DO GRADO, etc.)
- ❌ Título: "Cursos" (no dice de qué nivel)
- ❌ Tienes que hacer clic en "3 AÑOS" para ver sus cursos
- ❌ Luego hacer clic en "Agregar Curso"

---

## 🔍 ¿Por Qué Pasa Esto?

### Sistema Antiguo:
```
Nivel INICIAL → Cursos (directo)
```
- Los cursos están directamente bajo el nivel
- No hay "grados" intermedios

### Sistema Nuevo:
```
Nivel INICIAL → Grados (3 AÑOS, 4 AÑOS, 5 AÑOS) → Cursos
```
- Los cursos están bajo los grados
- Los grados están bajo los niveles
- Hay una capa extra

---

## 📊 Ejemplo Concreto

### Escenario: Quieres ver los cursos de INICIAL

**Sistema Antiguo:**
1. Estás en `/niveles`
2. Haces clic en "Gestión de Cursos" de INICIAL
3. Vas a `/admin/index.php?menu=2&nivel_id=34`
4. ✅ Ves: MATEMÁTICA, COMUNICACIÓN, CIENCIA (de INICIAL)

**Sistema Nuevo (ACTUAL - PROBLEMA):**
1. Estás en `/niveles`
2. Haces clic en "Gestión de Cursos" de INICIAL
3. Vas a `/cursos?nivel_id=34`
4. ❌ Ves: Lista de TODOS los grados (3 AÑOS, 4 AÑOS, 5 AÑOS, 1ER GRADO, 2DO GRADO, 3ER GRADO, etc.)
5. Tienes que hacer clic en "3 AÑOS"
6. Ahora sí ves los cursos de 3 AÑOS

---

## 🎨 Visualización del Problema

### Lo que esperas ver:
```
┌─────────────────────────────────┐
│  Cursos INICIAL                 │
├─────────────────────────────────┤
│  #  Curso         Descripción   │
│  1  MATEMÁTICA    ...           │
│  2  COMUNICACIÓN  ...           │
│  3  CIENCIA       ...           │
└─────────────────────────────────┘
```

### Lo que ves actualmente:
```
┌─────────────────────────────────┐
│  Cursos                         │
├─────────────────────────────────┤
│  #  Nivel      Grado            │
│  1  INICIAL    3 AÑOS           │
│  2  INICIAL    4 AÑOS           │
│  3  INICIAL    5 AÑOS           │
│  4  PRIMARIA   1ER GRADO        │
│  5  PRIMARIA   2DO GRADO        │
│  6  PRIMARIA   3ER GRADO        │
│  ... (todos los grados)         │
└─────────────────────────────────┘
```

---

## 💡 La Solución

Cuando llegas a `/cursos?nivel_id=34`, el sistema debe:

1. **Leer el `nivel_id=34` de la URL** ✅
2. **Filtrar para mostrar solo los grados de INICIAL** ✅
3. **Si INICIAL tiene solo 1 grado, auto-seleccionarlo** ✅
4. **Mostrar el título "Cursos - INICIAL"** ✅

### Resultado esperado:

**Si INICIAL tiene múltiples grados (3, 4, 5 años):**
```
┌─────────────────────────────────┐
│  Cursos - INICIAL               │
├─────────────────────────────────┤
│  #  Grado                       │
│  1  3 AÑOS      [Ver Cursos]    │
│  2  4 AÑOS      [Ver Cursos]    │
│  3  5 AÑOS      [Ver Cursos]    │
└─────────────────────────────────┘
```

**Si INICIAL tiene solo 1 grado:**
```
┌─────────────────────────────────┐
│  Cursos - INICIAL - 3 AÑOS      │
├─────────────────────────────────┤
│  #  Curso         Descripción   │
│  1  MATEMÁTICA    ...           │
│  2  COMUNICACIÓN  ...           │
│  3  CIENCIA       ...           │
└─────────────────────────────────┘
```

---

## 🔧 ¿Qué Hay Que Cambiar?

En el archivo `/bautista/resources/js/pages/Cursos/index.tsx`:

### Cambio 1: Leer el nivel_id de la URL
```typescript
// ANTES (no lee la URL)
useEffect(() => {
    api.get('/grados', { params: { per_page: 500 } })
}, []);

// DESPUÉS (lee nivel_id de la URL)
const params = new URLSearchParams(window.location.search);
const nivelId = params.get('nivel_id');

useEffect(() => {
    const filtro = nivelId 
        ? { nivel_id: nivelId, per_page: 500 }  // Filtrar por nivel
        : { per_page: 500 };                     // Mostrar todos
    
    api.get('/grados', { params: filtro })
}, [nivelId]);
```

### Cambio 2: Auto-seleccionar si hay un solo grado
```typescript
// Si viene de un nivel y solo hay 1 grado, seleccionarlo automáticamente
if (nivelId && grados.length === 1) {
    handleSelectGrado(grados[0]);
}
```

### Cambio 3: Actualizar el título
```typescript
// ANTES
<h1>Cursos</h1>

// DESPUÉS
<h1>Cursos {nivelNombre ? `- ${nivelNombre}` : ''}</h1>
```

---

## ✅ Resumen

**Problema:** El sistema nuevo ignora el `nivel_id` de la URL y muestra todos los grados.

**Solución:** Leer el `nivel_id`, filtrar los grados, y auto-seleccionar si solo hay uno.

**Resultado:** Experiencia similar al sistema antiguo, pero con la arquitectura mejorada del nuevo.

---

¿Ahora está más claro? 😊
