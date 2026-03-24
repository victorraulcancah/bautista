// Modelos de dominio del sistema educativo

export type Estudiante = {
    estu_id: number;
    insti_id: number;
    perfil_id: number;
    usuario_id: number;
    estado: '0' | '1';
    foto?: string;
    colegio?: string;
    fecha_i?: string;
    fecha_p?: string;
    mensualidad?: number;
    edad?: number;
};

export type Docente = {
    doc_id: number;
    insti_id: number;
    perfil_id: number;
    usuario_id: number;
    estado: '0' | '1';
    foto?: string;
    especialidad?: string;
};

export type Curso = {
    curso_id: number;
    nombre: string;
    descripcion?: string;
    estado: '0' | '1';
};

export type Matricula = {
    mat_id: number;
    estu_id: number;
    curso_id: number;
    anio: string;
    estado: '0' | '1';
};

export type NotaEstudiante = {
    nota_id: number;
    id_estudiante: number;
    id_curso: number;
    anio: string;
    promedio_final?: number;
    estado: '0' | '1';
};

export type Perfil = {
    perfil_id: number;
    nombres: string;
    apellidos: string;
    dni?: string;
    telefono?: string;
    direccion?: string;
};

// Paginación Laravel
export type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
};
