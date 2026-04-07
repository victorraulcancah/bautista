# 📖 Documentación de Lógica Académica

Este documento define la jerarquía y el flujo de datos del sistema académico para asegurar la coherencia entre el Backend y el Frontend (React/Inertia).

## 1. Jerarquía de Entidades

La estructura sigue un modelo de cascada desde lo general a lo específico:

### A. Niveles Educativos (`niveles_educativos`)
- **Nivel Superior:** Define las etapas académicas (Ej: Inicial, Primaria, Secundaria).
- **Atributos:** `nivel_id`, `nombre_nivel`.

### B. Cursos (`cursos`)
- **Pertenencia:** Se asocian principalmente al **Nivel Educativo**.
- **Lógica de Pool:** El nivel Secundaria tiene un "pool" de cursos (Matemática, Comunicación, etc.).
- **Gestión:** Al gestionar desde "Niveles", se accede a la lista plana de cursos de ese nivel.
- **Grado Opcional:** Un curso puede o no estar asignado a un grado específico en su creación inicial.

### C. Grados (`grados`)
- **Subdivisión:** Cada Nivel tiene varios grados (Ej: Secundaria -> 1er Año, 2do Año).
- **Atributos:** `grado_id`, `nombre_grado`.
- **Relación:** Los grados "heredan" o filtran los cursos que pertenecen a su nivel.

### D. Secciones (`secciones`)
- **Grupo Físico:** La división final donde están los alumnos (Ej: 1er Año Sección "A").
- **Relación:** Pertenecen estrictamente a un **Grado**.

---

## 2. Flujo de Navegación (Frontend)

Para replicar la fluidez del sistema anterior, el flujo en el ERP es:

1.  **Módulo Niveles:** Punto de entrada principal.
2.  **Botón "Gestionar Cursos":** 
    *   URL: `/cursos?nivel_id=XX`
    *   **Acción:** Muestra directamente la lista de cursos del nivel (Pool de materias).
    *   **Modal:** Permite crear cursos para ese nivel sin obligar a elegir grado.
3.  **Módulo Grados/Secciones:** 
    *   Se entra para ver qué secciones tiene cada grado.
    *   Permite ver los cursos específicos asignados a ese grado para el horario.

## 4. Gestión de Asignaciones (Pivot)
- **Tabla:** `grados_cursos`
- **Lógica:** Permite que un curso del "Pool" de un nivel sea asignado a uno o varios grados específicos del mismo nivel.
- **Estado:** Se maneja un `grac_estado` para activar/desactivar la materia en un grado sin borrarla del pool.

---

## 5. Especificaciones Técnicas del Modal (Cursos)

- **Layout:** 2 columnas (Imagen izquierda, Formulario derecha).
- **Diseño:** Debe usar componentes del **Sistema ERP** (`FormField`, `FormSection`, etc.).
- **Campos:**
    - **Imagen:** Carga de archivo (logo/foto).
    - **Nivel:** Bloqueado según el contexto.
    - **Nombre:** Campo de texto libre (Input), NO selector.
    - **Descripción:** Área de texto libre.
- **Grado:** No se solicita en la creación del curso del nivel (Pool).

---

## 6. Notas de Implementación
- Las imágenes de los cursos se almacenan en `storage/app/public/cursos/logos`.
- Las actualizaciones de cursos con imagen deben usar el método `POST` con `_method=PUT` para compatibilidad con Laravel Multipart.
- En la tabla de cursos por nivel, la columna **Grado** se oculta para no confundir al usuario.
