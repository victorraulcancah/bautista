# Inventario de Vistas - Rol Administrador

Este documento lista todas las vistas maestras que el Administrador utiliza actualmente. Estas vistas servirán como base para la unificación del sistema.

| Sección | Menú / Funcionalidad | Ruta Laravel (URL) | Componente Frontend (Inertia) |
| :--- | :--- | :--- | :--- |
| **NAVEGACIÓN** | Inicio (Dashboard) | `/dashboard` | `Dashboard/index` |
| | Institución (Datos) | `/institucion` | `Institucion/index` |
| | Institución (Galería) | `/institucion/galeria` | `Institucion/Galeria/index` |
| | Institución (Noticias) | `/institucion/noticias` | `Institucion/Noticias/index` |
| | Comunicados | `/comunicados` | `Comunicados/index` |
| | Pagos | `/pagos` | `Pagos/index` |
| **ACADÉMICA** | Niveles | `/niveles` | `Niveles/index` |
| | Grados / Cursos | `/cursos` | `Cursos/index` |
| | Grados / Secciones | `/secciones` | `Secciones/index` |
| | Gestión de Docentes | `/docentes` | `GestionDocentes/index` |
| | Gestión de Alumnos | `/estudiantes` | `GestionAlumnos/index` |
| **ADMINIST.** | Matrícula (Apertura) | `/matriculas` | `Matricula/index` |
| | Matrícula (Gestión) | `/matriculas/gestion` | `Matricula/Gestion` |
| | Asistencia (General) | `/asistencia` | `Asistencia/index` |
| | Asistencia (Escáner) | `/asistencia/scanner` | `Asistencia/Scanner` |
| **RECURSOS** | Biblioteca | `/biblioteca` | `Medios/index` |
| | Mensajes Privados | `/mensajeria` | `MensajesPrivados/index` |
| **USUARIOS** | Gestión de Usuarios | `/usuarios` | `Usuarios/index` |
| | Perfil de Usuario | `/settings/profile` | `settings/profile` |
| | Seguridad / Pass | `/settings/security` | `settings/security` |

---

## 🚫 Vistas Duplicadas (A eliminar después de la unificación)
Estas son las vistas que actualmente "viven solas" y que migraremos a las vistas maestras de arriba:

- `PortalAlumno/*` (Dashboard, Cursos, Notas, Asistencia)
- `PortalDocente/*` (Dashboard, Mis Cursos, Mis Alumnos)
- `PortalPadre/*` (Dashboard, Matrícula Wizard)

## 💡 Estrategia de Unificación
Por ejemplo: La ruta `/asistencia` hoy es solo para Admin. Mañana, si un **Docente** entra a `/asistencia`, el componente `Asistencia/index` detectará su rol y le mostrará solo sus cursos, en lugar de ir a un portal separado.
