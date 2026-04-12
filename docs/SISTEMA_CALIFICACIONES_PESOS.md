# 📊 SISTEMA DE CALIFICACIONES CON PESOS Y PORCENTAJES

**Fecha**: 2026-04-10  
**Sistema**: LMS Bautista La Pascana

---

## 🎯 CONCEPTO GENERAL

El sistema permite que cada actividad tenga:
1. **Puntos máximos propios** (ej: cuestionario de 10 puntos, examen de 20 puntos)
2. **Peso/porcentaje** en la nota final de la unidad (ej: 10%, 40%)
3. **Conversión automática** a escala 0-20 (sistema peruano)

---

## 📐 FÓRMULA DE CÁLCULO

### Paso 1: Calcular nota en escala 0-20
```
notaEscala20 = (puntosObtenidos / puntosMaximos) × 20
```

### Paso 2: Aplicar peso de la actividad
```
notaPonderada = notaEscala20 × (peso / 100)
```

### Paso 3: Sumar todas las actividades de la unidad
```
notaFinalUnidad = Σ(notaPonderada de cada actividad)
```

**Restricción**: La suma de pesos de todas las actividades de una unidad debe ser 100%

---

## 💡 EJEMPLO PRÁCTICO

### BIMESTRE 1 - Configuración del Docente

| Actividad | Puntos Máximos | Peso | Descripción |
|-----------|----------------|------|-------------|
| Cuestionario 1 | 10 | 10% | 5 preguntas de 2 puntos c/u |
| Tarea Grupal | 20 | 20% | Trabajo en equipo |
| Examen Parcial | 20 | 40% | 10 preguntas de 2 puntos c/u |
| Participación | 20 | 30% | Evaluación continua |
| **TOTAL** | - | **100%** | - |

### Estudiante: María López

#### 1. Cuestionario 1
- Puntos obtenidos: **8 / 10**
- Escala 20: (8 / 10) × 20 = **16**
- Con peso: 16 × 0.10 = **1.6**

#### 2. Tarea Grupal
- Puntos obtenidos: **18 / 20**
- Escala 20: (18 / 20) × 20 = **18**
- Con peso: 18 × 0.20 = **3.6**

#### 3. Examen Parcial
- Puntos obtenidos: **15 / 20**
- Escala 20: (15 / 20) × 20 = **15**
- Con peso: 15 × 0.40 = **6.0**

#### 4. Participación
- Puntos obtenidos: **17 / 20**
- Escala 20: (17 / 20) × 20 = **17**
- Con peso: 17 × 0.30 = **5.1**

### 📊 NOTA FINAL BIMESTRE 1
```
1.6 + 3.6 + 6.0 + 5.1 = 16.3
```

**Resultado**: María obtuvo **16.3** en el Bimestre 1

---

## 🗄️ ESTRUCTURA DE BASE DE DATOS

### Tabla: `actividad_curso`

```sql
CREATE TABLE actividad_curso (
    actividad_id BIGINT PRIMARY KEY,
    nombre_actividad VARCHAR(200),
    nota_actividad VARCHAR(5),           -- Nota máxima en escala 20 (legacy)
    peso_porcentaje DECIMAL(5,2),        -- Peso en % (ej: 40.00)
    puntos_maximos DECIMAL(8,2),         -- Puntos máximos (ej: 10, 20, 100)
    ...
);
```

### Campos Nuevos:

- **`peso_porcentaje`**: Porcentaje que vale la actividad (0-100)
  - Ejemplo: `40.00` = 40%
  - Ejemplo: `10.50` = 10.5%

- **`puntos_maximos`**: Puntos máximos de la actividad
  - Ejemplo: `10` = cuestionario de 10 puntos
  - Ejemplo: `20` = examen de 20 puntos
  - Ejemplo: `100` = examen de 100 puntos

---

## 🔧 IMPLEMENTACIÓN EN CÓDIGO

### Backend - Calcular Nota Ponderada

```php
// app/Services/CalificacionService.php

public function calcularNotaPonderada($puntosObtenidos, $puntosMaximos, $peso)
{
    // Paso 1: Convertir a escala 0-20
    $notaEscala20 = ($puntosObtenidos / $puntosMaximos) * 20;
    
    // Paso 2: Aplicar peso
    $notaPonderada = $notaEscala20 * ($peso / 100);
    
    return round($notaPonderada, 2);
}

public function calcularNotaFinalUnidad($unidadId, $estudianteId)
{
    $actividades = ActividadCurso::where('id_unidad', $unidadId)->get();
    $notaFinal = 0;
    
    foreach ($actividades as $actividad) {
        $nota = NotaActividadEstudiante::where('actividad_id', $actividad->actividad_id)
            ->where('estu_id', $estudianteId)
            ->first();
        
        if ($nota) {
            $puntosObtenidos = floatval($nota->nota);
            $puntosMaximos = floatval($actividad->puntos_maximos);
            $peso = floatval($actividad->peso_porcentaje);
            
            $notaPonderada = $this->calcularNotaPonderada(
                $puntosObtenidos, 
                $puntosMaximos, 
                $peso
            );
            
            $notaFinal += $notaPonderada;
        }
    }
    
    return round($notaFinal, 2);
}
```

### Frontend - Formulario de Actividad

```tsx
// CreateActivityModal.tsx

interface ActivityForm {
    nombre_actividad: string;
    puntos_maximos: number;      // Nuevo campo
    peso_porcentaje: number;      // Nuevo campo
    fecha_inicio: Date;
    fecha_cierre: Date;
    // ... otros campos
}

// En el formulario:
<div>
    <label>Puntos Máximos</label>
    <input 
        type="number" 
        min="1"
        max="100"
        value={form.puntos_maximos}
        onChange={(e) => setForm({...form, puntos_maximos: e.target.value})}
        placeholder="Ej: 10, 20, 100"
    />
    <p className="text-xs text-gray-500">
        Puntos totales de la actividad (se convertirá a escala 0-20)
    </p>
</div>

<div>
    <label>Peso en la Unidad (%)</label>
    <input 
        type="number" 
        min="0"
        max="100"
        step="0.01"
        value={form.peso_porcentaje}
        onChange={(e) => setForm({...form, peso_porcentaje: e.target.value})}
        placeholder="Ej: 40"
    />
    <p className="text-xs text-gray-500">
        Porcentaje que vale esta actividad en la nota final de la unidad
    </p>
</div>

{/* Validación de suma de pesos */}
{sumaPesos > 100 && (
    <div className="p-4 bg-red-50 rounded-xl text-red-600 text-sm">
        ⚠️ La suma de pesos de todas las actividades excede el 100%
    </div>
)}
```

---

## 📋 VALIDACIONES NECESARIAS

### 1. Suma de Pesos = 100%
```javascript
const validarPesosUnidad = (unidadId) => {
    const actividades = getActividadesByUnidad(unidadId);
    const sumaPesos = actividades.reduce((sum, act) => sum + act.peso_porcentaje, 0);
    
    if (sumaPesos !== 100) {
        throw new Error(`La suma de pesos debe ser 100%. Actual: ${sumaPesos}%`);
    }
};
```

### 2. Puntos Obtenidos ≤ Puntos Máximos
```javascript
const validarNota = (puntosObtenidos, puntosMaximos) => {
    if (puntosObtenidos > puntosMaximos) {
        throw new Error('Los puntos obtenidos no pueden exceder los puntos máximos');
    }
};
```

### 3. Peso entre 0-100
```javascript
const validarPeso = (peso) => {
    if (peso < 0 || peso > 100) {
        throw new Error('El peso debe estar entre 0 y 100%');
    }
};
```

---

## 🎨 UI/UX - Mostrar Información

### En la Lista de Actividades
```tsx
<div className="activity-card">
    <h3>{actividad.nombre_actividad}</h3>
    <div className="activity-meta">
        <span className="badge">
            {actividad.puntos_maximos} pts
        </span>
        <span className="badge-weight">
            {actividad.peso_porcentaje}% del bimestre
        </span>
    </div>
</div>
```

### En la Tabla de Calificaciones
```tsx
<table>
    <thead>
        <tr>
            <th>Estudiante</th>
            <th>
                Cuestionario 1
                <small>10 pts • 10%</small>
            </th>
            <th>
                Examen
                <small>20 pts • 40%</small>
            </th>
            <th>Nota Final</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>María López</td>
            <td>
                8/10
                <small className="text-gray-500">→ 1.6</small>
            </td>
            <td>
                15/20
                <small className="text-gray-500">→ 6.0</small>
            </td>
            <td className="font-bold">16.3</td>
        </tr>
    </tbody>
</table>
```

---

## 🚀 PLAN DE IMPLEMENTACIÓN

### Fase 1: Base de Datos ✅
- [x] Crear migración para agregar campos `peso_porcentaje` y `puntos_maximos`

### Fase 2: Backend
- [ ] Actualizar modelo `ActividadCurso` con nuevos campos
- [ ] Crear servicio `CalificacionService` con métodos de cálculo
- [ ] Actualizar API de calificaciones para incluir cálculos ponderados
- [ ] Agregar validaciones de suma de pesos

### Fase 3: Frontend
- [ ] Actualizar formulario de creación de actividades
- [ ] Agregar campos de puntos máximos y peso
- [ ] Mostrar validación de suma de pesos en tiempo real
- [ ] Actualizar tabla de calificaciones para mostrar notas ponderadas
- [ ] Agregar indicadores visuales de peso de cada actividad

### Fase 4: Testing
- [ ] Probar cálculos con diferentes escenarios
- [ ] Validar que la suma de pesos sea 100%
- [ ] Verificar conversión a escala 0-20
- [ ] Probar exportación de calificaciones

---

## 📊 CASOS DE USO

### Caso 1: Cuestionario de 10 puntos (10% del bimestre)
- Estudiante obtiene: 8/10
- Cálculo: (8/10) × 20 × 0.10 = 1.6
- Contribución a nota final: 1.6 puntos

### Caso 2: Examen de 100 puntos (40% del bimestre)
- Estudiante obtiene: 75/100
- Cálculo: (75/100) × 20 × 0.40 = 6.0
- Contribución a nota final: 6.0 puntos

### Caso 3: Tarea de 20 puntos (20% del bimestre)
- Estudiante obtiene: 18/20
- Cálculo: (18/20) × 20 × 0.20 = 3.6
- Contribución a nota final: 3.6 puntos

---

## ⚠️ CONSIDERACIONES IMPORTANTES

1. **Escala Peruana**: Siempre se trabaja en escala 0-20
2. **Nota Aprobatoria**: 11 o más (55% de 20)
3. **Redondeo**: Usar 2 decimales para precisión
4. **Suma de Pesos**: Debe ser exactamente 100% por unidad
5. **Flexibilidad**: Cada actividad puede tener diferentes puntos máximos

---

**Última actualización**: 2026-04-10  
**Estado**: 🟡 En implementación
