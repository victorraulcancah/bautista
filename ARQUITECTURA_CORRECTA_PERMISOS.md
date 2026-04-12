# Arquitectura Correcta: Un Solo Dashboard con Permisos

## 🎯 Concepto Correcto

**❌ MAL (Actual):** Dashboards separados por rol
```
PortalAlumno/Dashboard.tsx
PortalDocente/Dashboard.tsx  
PortalPadre/Dashboard.tsx
Dashboard/index.tsx (admin)
```

**✅ BIEN (Propuesto):** UN dashboard que muestra widgets según permisos
```
Dashboard.tsx (único)
  └─ Renderiza widgets según permisos del usuario
```

---

## 📐 ESTRUCTURA CORRECTA

```
resources/js/
├── components/
│   ├── auth/
│   │   └── Can.tsx                    # Componente de permisos
│   │
│   ├── dashboard/
│   │   └── widgets/                   # ✅ Widgets reutilizables
│   │       ├── StatsCard.tsx          # Card de estadística
│   │       ├── MisCursosWidget.tsx    # Widget de cursos
│   │       ├── AsistenciaWidget.tsx   # Widget de asistencia
│   │       ├── NotasWidget.tsx        # Widget de notas
│   │       ├── TareasPendientesWidget.tsx
│   │       ├── EstudiantesWidget.tsx
│   │       ├── AccesosRapidosWidget.tsx
│   │       ├── NotificacionesWidget.tsx
│   │       └── ActividadRecienteWidget.tsx
│   │
│   ├── asistencia/
│   │   ├── AsistenciaTable.tsx        # Tabla reutilizable
│   │   ├── AsistenciaFilters.tsx
│   │   └── AsistenciaStats.tsx
│   │
│   ├── cursos/
│   │   ├── CursosList.tsx
│   │   ├── CursoCard.tsx
│   │   └── CursoActions.tsx
│   │
│   └── shared/
│       ├── ResourcePage.tsx
│       ├── PageHeader.tsx
│       └── SectionCard.tsx
│
├── pages/
│   ├── Dashboard.tsx                  # ✅ ÚNICO dashboard
│   ├── Asistencia.tsx                 # ✅ ÚNICA vista
│   ├── Cursos.tsx                     # ✅ ÚNICA vista
│   ├── Notas.tsx                      # ✅ ÚNICA vista
│   │
│   # Vistas específicas admin (sin duplicados)
│   ├── Estudiantes.tsx
│   ├── Docentes.tsx
│   ├── Matriculas.tsx
│   ├── Pagos.tsx
│   └── Usuarios.tsx
│
└── hooks/
    ├── usePermissions.ts
    ├── useDashboard.ts
    └── useAuth.ts
```

---

## 💡 DASHBOARD ÚNICO CON WIDGETS CONDICIONALES

### Dashboard.tsx (Único)

```typescript
// resources/js/pages/Dashboard.tsx
import { Head } from '@inertiajs/react';
import { TrendingUp } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import PageHeader from '@/components/shared/PageHeader';
import { Can } from '@/components/auth/Can';
import { usePermissions } from '@/hooks/usePermissions';
import { useDashboard } from '@/hooks/useDashboard';

// Widgets
import StatsCard from '@/components/dashboard/widgets/StatsCard';
import MisCursosWidget from '@/components/dashboard/widgets/MisCursosWidget';
import AsistenciaWidget from '@/components/dashboard/widgets/AsistenciaWidget';
import NotasWidget from '@/components/dashboard/widgets/NotasWidget';
import TareasPendientesWidget from '@/components/dashboard/widgets/TareasPendientesWidget';
import EstudiantesWidget from '@/components/dashboard/widgets/EstudiantesWidget';
import AccesosRapidosWidget from '@/components/dashboard/widgets/AccesosRapidosWidget';
import NotificacionesWidget from '@/components/dashboard/widgets/NotificacionesWidget';

export default function Dashboard() {
  const { user, can, hasRole } = usePermissions();
  const { stats, loading } = useDashboard();

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <AppLayout>
      <Head title="Dashboard" />
      
      <div className="flex flex-col gap-8 p-6">
        {/* Header personalizado según rol */}
        <PageHeader
          icon={TrendingUp}
          title={
            hasRole('administrador') ? 'Panel de Control' :
            hasRole('docente') ? `Bienvenido, Profesor ${user.name}` :
            hasRole('estudiante') ? `¡Hola, ${user.name}!` :
            'Mi Portal'
          }
          subtitle={
            hasRole('administrador') ? 'IEP Bautista La Pascana' :
            hasRole('docente') ? 'Portal del Docente' :
            hasRole('estudiante') ? stats.seccion : 
            'Portal de Padres'
          }
          iconColor="bg-indigo-600"
        />

        {/* Stats Cards - Diferentes según permisos */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Admin: Stats generales */}
          <Can permission="estudiantes.view">
            <StatsCard
              title="Total Estudiantes"
              value={stats.total_estudiantes}
              icon="Users"
              color="blue"
              href="/estudiantes"
            />
          </Can>

          <Can permission="docentes.view">
            <StatsCard
              title="Total Docentes"
              value={stats.total_docentes}
              icon="UserCheck"
              color="green"
              href="/docentes"
            />
          </Can>

          <Can permission="cursos.view">
            <StatsCard
              title="Cursos Activos"
              value={stats.total_cursos}
              icon="BookOpen"
              color="purple"
              href="/cursos"
            />
          </Can>

          {/* Docente: Sus stats */}
          <Can role="docente">
            <StatsCard
              title="Mis Cursos"
              value={stats.mis_cursos}
              icon="BookOpen"
              color="blue"
              href="/cursos"
            />
            <StatsCard
              title="Mis Estudiantes"
              value={stats.mis_estudiantes}
              icon="Users"
              color="green"
            />
            <StatsCard
              title="Pendientes Calificar"
              value={stats.pendientes_calificar}
              icon="FileText"
              color="orange"
            />
          </Can>

          {/* Estudiante: Sus stats */}
          <Can role="estudiante">
            <StatsCard
              title="Mis Cursos"
              value={stats.cursos_matriculados}
              icon="BookOpen"
              color="blue"
              href="/cursos"
            />
            <StatsCard
              title="Tareas Pendientes"
              value={stats.tareas_pendientes}
              icon="Calendar"
              color="orange"
            />
            <StatsCard
              title="Asistencia"
              value={`${stats.porcentaje_asistencia}%`}
              icon="UserCheck"
              color="green"
              href="/asistencia"
            />
          </Can>

          {/* Padre: Stats de sus hijos */}
          <Can role={['padre_familia', 'madre_familia', 'apoderado']}>
            <StatsCard
              title="Mis Hijos"
              value={stats.total_hijos}
              icon="Users"
              color="blue"
            />
            <StatsCard
              title="Pagos Pendientes"
              value={stats.pagos_pendientes}
              icon="CreditCard"
              color="orange"
              href="/pagos"
            />
          </Can>
        </div>

        {/* Widgets Grid - Diferentes según permisos */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          
          {/* Columna Principal */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Widget: Mis Cursos (Docente y Estudiante) */}
            <Can permission="cursos.view">
              <MisCursosWidget cursos={stats.cursos} />
            </Can>

            {/* Widget: Estudiantes (Admin) */}
            <Can permission="estudiantes.view">
              <EstudiantesWidget estudiantes={stats.estudiantes_recientes} />
            </Can>

            {/* Widget: Tareas Pendientes (Estudiante) */}
            <Can role="estudiante">
              <TareasPendientesWidget tareas={stats.tareas_pendientes} />
            </Can>

            {/* Widget: Notas Recientes (Estudiante) */}
            <Can role="estudiante">
              <NotasWidget notas={stats.notas_recientes} />
            </Can>

            {/* Widget: Asistencia (Todos) */}
            <Can permission="asistencia.view">
              <AsistenciaWidget data={stats.asistencia} />
            </Can>
          </div>

          {/* Columna Lateral */}
          <div className="space-y-8">
            
            {/* Widget: Accesos Rápidos (Todos) */}
            <AccesosRapidosWidget />

            {/* Widget: Notificaciones (Todos) */}
            <NotificacionesWidget notificaciones={stats.notificaciones} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
```

---

## 🧩 WIDGETS REUTILIZABLES

### 1. MisCursosWidget

```typescript
// resources/js/components/dashboard/widgets/MisCursosWidget.tsx
import { Link } from '@inertiajs/react';
import { BookOpen, ChevronRight } from 'lucide-react';
import SectionCard from '@/components/shared/SectionCard';
import { usePermissions } from '@/hooks/usePermissions';
import { Can } from '@/components/auth/Can';

interface MisCursosWidgetProps {
  cursos: Curso[];
}

export default function MisCursosWidget({ cursos }: MisCursosWidgetProps) {
  const { hasRole } = usePermissions();

  return (
    <SectionCard 
      title={hasRole('docente') ? 'Mis Cursos Asignados' : 'Mis Cursos'}
      icon={BookOpen}
    >
      <div className="space-y-3">
        {cursos.length === 0 ? (
          <p className="py-8 text-center text-gray-400 italic">
            No tienes cursos {hasRole('docente') ? 'asignados' : 'matriculados'}.
          </p>
        ) : (
          cursos.map(curso => (
            <Link
              key={curso.id}
              href={`/cursos/${curso.id}`}
              className="flex items-center justify-between p-4 rounded-xl border hover:bg-gray-50 transition-colors"
            >
              <div>
                <h4 className="font-bold text-gray-900">{curso.nombre}</h4>
                <p className="text-sm text-gray-600">
                  {hasRole('docente') && `${curso.estudiantes_count} estudiantes`}
                  {hasRole('estudiante') && `Docente: ${curso.docente?.nombre}`}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Botones según permisos */}
                <Can permission="contenido.create">
                  <Link
                    href={`/cursos/${curso.id}/contenido`}
                    className="px-3 py-1 text-xs font-bold bg-blue-50 text-blue-600 rounded-lg"
                  >
                    Gestionar
                  </Link>
                </Can>
                
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </Link>
          ))
        )}
      </div>
    </SectionCard>
  );
}
```

### 2. AsistenciaWidget

```typescript
// resources/js/components/dashboard/widgets/AsistenciaWidget.tsx
import { CalendarCheck } from 'lucide-react';
import SectionCard from '@/components/shared/SectionCard';
import { usePermissions } from '@/hooks/usePermissions';

interface AsistenciaWidgetProps {
  data: {
    porcentaje: number;
    ultimos_registros: AsistenciaRegistro[];
  };
}

export default function AsistenciaWidget({ data }: AsistenciaWidgetProps) {
  const { hasRole } = usePermissions();

  return (
    <SectionCard 
      title={hasRole('estudiante') ? 'Mi Asistencia' : 'Asistencia General'}
      icon={CalendarCheck}
    >
      {/* Porcentaje */}
      <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
        <div className="text-center">
          <div className="text-4xl font-black text-green-600">
            {data.porcentaje}%
          </div>
          <p className="text-sm text-gray-600">Asistencia General</p>
        </div>
      </div>

      {/* Últimos registros */}
      <div className="space-y-2">
        {data.ultimos_registros.map(registro => (
          <div key={registro.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="text-sm font-bold">{registro.fecha}</p>
              <p className="text-xs text-gray-600">{registro.turno}</p>
            </div>
            <span className={`px-2 py-1 text-xs font-bold rounded ${
              registro.estado === '1' ? 'bg-green-100 text-green-700' :
              registro.estado === 'T' ? 'bg-orange-100 text-orange-700' :
              'bg-red-100 text-red-700'
            }`}>
              {registro.estado === '1' ? 'Asistió' :
               registro.estado === 'T' ? 'Tardanza' : 'Falta'}
            </span>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
```

### 3. TareasPendientesWidget (Solo Estudiantes)

```typescript
// resources/js/components/dashboard/widgets/TareasPendientesWidget.tsx
import { Link } from '@inertiajs/react';
import { Calendar, Clock } from 'lucide-react';
import SectionCard from '@/components/shared/SectionCard';
import { Button } from '@/components/ui/button';

interface TareasPendientesWidgetProps {
  tareas: Tarea[];
}

export default function TareasPendientesWidget({ tareas }: TareasPendientesWidgetProps) {
  return (
    <SectionCard title="Próximas Actividades" icon={Calendar}>
      <div className="space-y-3">
        {tareas.length === 0 ? (
          <p className="py-8 text-center text-gray-400 italic">
            ¡Estás al día! No hay tareas pendientes.
          </p>
        ) : (
          tareas.map(tarea => (
            <div key={tarea.id} className="p-4 border rounded-xl hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900">{tarea.nombre}</h4>
                  <p className="text-sm text-gray-600">{tarea.curso}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-orange-600">
                    <Clock className="h-3 w-3" />
                    Vence: {new Date(tarea.fecha_cierre).toLocaleDateString()}
                  </div>
                </div>
                <Link href={`/actividades/${tarea.id}`}>
                  <Button size="sm">Ver</Button>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </SectionCard>
  );
}
```

### 4. AccesosRapidosWidget (Todos)

```typescript
// resources/js/components/dashboard/widgets/AccesosRapidosWidget.tsx
import { Link } from '@inertiajs/react';
import { MessageSquare, Newspaper, Folder, QrCode, Users, BookOpen } from 'lucide-react';
import SectionCard from '@/components/shared/SectionCard';
import { Can } from '@/components/auth/Can';

export default function AccesosRapidosWidget() {
  return (
    <SectionCard title="Accesos Rápidos">
      <div className="grid grid-cols-2 gap-3">
        
        {/* Mensajería (Todos) */}
        <Can permission="mensajes.view">
          <Link
            href="/mensajeria"
            className="flex flex-col items-center p-4 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors"
          >
            <MessageSquare className="h-6 w-6 text-indigo-600 mb-2" />
            <span className="text-xs font-bold text-gray-700">Mensajes</span>
          </Link>
        </Can>

        {/* Comunicados (Todos) */}
        <Link
          href="/comunicados"
          className="flex flex-col items-center p-4 bg-rose-50 rounded-xl hover:bg-rose-100 transition-colors"
        >
          <Newspaper className="h-6 w-6 text-rose-600 mb-2" />
          <span className="text-xs font-bold text-gray-700">Noticias</span>
        </Link>

        {/* Biblioteca (Todos) */}
        <Link
          href="/biblioteca"
          className="flex flex-col items-center p-4 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors"
        >
          <Folder className="h-6 w-6 text-amber-600 mb-2" />
          <span className="text-xs font-bold text-gray-700">Biblioteca</span>
        </Link>

        {/* Scanner QR (Admin y Docente) */}
        <Can permission="asistencia.mark">
          <Link
            href="/asistencia/scanner"
            className="flex flex-col items-center p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
          >
            <QrCode className="h-6 w-6 text-green-600 mb-2" />
            <span className="text-xs font-bold text-gray-700">Scanner</span>
          </Link>
        </Can>

        {/* Estudiantes (Admin) */}
        <Can permission="estudiantes.view">
          <Link
            href="/estudiantes"
            className="flex flex-col items-center p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
          >
            <Users className="h-6 w-6 text-blue-600 mb-2" />
            <span className="text-xs font-bold text-gray-700">Estudiantes</span>
          </Link>
        </Can>

        {/* Cursos */}
        <Can permission="cursos.view">
          <Link
            href="/cursos"
            className="flex flex-col items-center p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors"
          >
            <BookOpen className="h-6 w-6 text-purple-600 mb-2" />
            <span className="text-xs font-bold text-gray-700">Cursos</span>
          </Link>
        </Can>
      </div>
    </SectionCard>
  );
}
```

---

## 🔄 OTRAS VISTAS UNIFICADAS

### Asistencia.tsx (Única)

```typescript
// resources/js/pages/Asistencia.tsx
import { Head } from '@inertiajs/react';
import { CalendarDays } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import ResourcePage from '@/components/shared/ResourcePage';
import { usePermissions } from '@/hooks/usePermissions';
import { Can } from '@/components/auth/Can';

// Componentes
import AsistenciaTable from '@/components/asistencia/AsistenciaTable';
import AsistenciaFilters from '@/components/asistencia/AsistenciaFilters';
import AsistenciaStats from '@/components/asistencia/AsistenciaStats';
import { Button } from '@/components/ui/button';

export default function Asistencia() {
  const { hasRole } = usePermissions();
  const { registros, stats, filters, setFilters } = useAsistencia();

  return (
    <AppLayout>
      <Head title="Asistencia" />
      
      <ResourcePage
        pageTitle="Control de Asistencia"
        subtitle={
          hasRole('administrador') ? "Gestión completa" :
          hasRole('docente') ? "Registro de tus alumnos" :
          "Tu historial de asistencia"
        }
        icon={CalendarDays}
      >
        {/* Estadísticas (Todos pueden ver) */}
        <AsistenciaStats stats={stats} />

        {/* Filtros (Admin y Docente) */}
        <Can permission="asistencia.mark">
          <AsistenciaFilters filters={filters} onChange={setFilters} />
        </Can>

        {/* Botón Scanner (Admin y Docente) */}
        <Can permission="asistencia.mark">
          <div className="mb-4">
            <Button href="/asistencia/scanner">
              Abrir Scanner QR
            </Button>
          </div>
        </Can>

        {/* Tabla de asistencia */}
        <AsistenciaTable
          registros={registros}
          showActions={hasRole(['administrador', 'docente'])}
          viewMode={
            hasRole('administrador') ? 'admin' :
            hasRole('docente') ? 'docente' :
            'estudiante'
          }
        />
      </ResourcePage>
    </AppLayout>
  );
}
```

---

## 📊 RESUMEN DE LA ARQUITECTURA CORRECTA

### ✅ Lo que SÍ hacemos:
1. **UN dashboard** que renderiza widgets según permisos
2. **Widgets reutilizables** que se muestran/ocultan con `<Can>`
3. **Componentes inteligentes** que adaptan su contenido según el rol
4. **Permisos granulares** para controlar cada acción

### ❌ Lo que NO hacemos:
1. ~~Dashboards separados por rol~~
2. ~~Vistas duplicadas~~
3. ~~Lógica hardcodeada de roles~~
4. ~~Carpetas PortalAlumno, PortalDocente, PortalPadre~~

### 🎯 Resultado:
- **1 Dashboard** en lugar de 4
- **1 Vista de Asistencia** en lugar de 3
- **1 Vista de Cursos** en lugar de 3
- **Widgets reutilizables** que se componen según permisos
- **Mantenimiento simple:** cambiar un widget afecta a todos los roles

---

## 📈 COMPARACIÓN

### Antes (Mal):
```
Dashboard/index.tsx          (Admin)
PortalAlumno/Dashboard.tsx   (Estudiante)
PortalDocente/Dashboard.tsx  (Docente)
PortalPadre/Dashboard.tsx    (Padre)
= 4 archivos duplicados
```

### Después (Bien):
```
Dashboard.tsx                (Único, con widgets condicionales)
  ├─ widgets/StatsCard.tsx
  ├─ widgets/MisCursosWidget.tsx
  ├─ widgets/AsistenciaWidget.tsx
  └─ widgets/AccesosRapidosWidget.tsx
= 1 archivo + widgets reutilizables
```

---

**Conclusión:** Un solo dashboard con widgets que se muestran/ocultan según permisos. Sin duplicación, máxima reutilización.
