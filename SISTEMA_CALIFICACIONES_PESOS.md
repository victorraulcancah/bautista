# Sistema de Calificaciones con Pesos y Porcentajes

Este documento describe la lógica implementada para el cálculo de promedios ponderados en el LMS.

## 📊 Estructura de Calificación

Cada actividad dentro de una unidad tiene dos parámetros clave:
1. **Puntos Máximos (`puntos_maximos`)**: El puntaje tope de la actividad (ej. 10, 20 o 100 puntos).
2. **Peso Porcentual (`peso_porcentaje`)**: El valor relativo de la actividad dentro de la unidad (ej. 40%).

### Ejemplo de Configuración
- **Cuestionario 1**: 10 puntos, 10% de la nota final.
- **Examen Parcial**: 20 puntos, 40% de la nota final.
- **Tarea 1**: 20 puntos, 20% de la nota final.
- **Participación**: 20 puntos, 30% de la nota final.

## 🧮 Fórmulas de Cálculo

El cálculo se realiza en tres pasos para garantizar la consistencia en una escala vigesimal (0-20).

### 1. Normalización a Escala 20
Todas las notas se convierten a base 20 antes de aplicar el peso.
```
nota_normalizada = (puntos_obtenidos / puntos_maximos) * 20
```

### 2. Aplicación de Ponderación
Se multiplica la nota normalizada por su peso relativo.
```
nota_ponderada = nota_normalizada * (peso_porcentaje / 100)
```

### 3. Nota Final de la Unidad/Bimestre
Es la suma de todas las notas ponderadas de las actividades pertenecientes a esa unidad.
```
nota_final = Σ(nota_ponderada de cada actividad)
```

## 📝 Ejemplo Práctico

Estudiante: **Juan Pérez**

1. **Cuestionario** (Puntos Máx: 10, Peso: 10%):
   - Obtuvo: 8/10
   - Normalización: (8 / 10) * 20 = 16.0
   - Ponderación: 16.0 * 0.10 = **1.6**

2. **Examen** (Puntos Máx: 20, Peso: 40%):
   - Obtuvo: 15/20
   - Normalización: (15 / 20) * 20 = 15.0
   - Ponderación: 15.0 * 0.40 = **6.0**

3. **Tarea** (Puntos Máx: 20, Peso: 20%):
   - Obtuvo: 18/20
   - Normalización: (18 / 20) * 20 = 18.0
   - Ponderación: 18.0 * 0.20 = **3.6**

4. **Participación** (Puntos Máx: 20, Peso: 30%):
   - Obtuvo: 14/20
   - Normalización: (14 / 20) * 20 = 14.0
   - Ponderación: 14.0 * 0.30 = **4.2**

**NOTA FINAL = 1.6 + 6.0 + 3.6 + 4.2 = 15.4**

## 💻 Implementación Técnica

### Base de Datos
Se agregaron los campos a la tabla `actividad_curso`:
- `peso_porcentaje`: decimal(5,2)
- `puntos_maximos`: decimal(8,2)

### Lógica de Backend
La lógica reside en el servicio `DocenteAlumnoService`, el cual realiza las operaciones en memoria tras cargar las actividades y notas para optimizar el rendimiento (evitando el problema N+1).
