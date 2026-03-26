export type MatriculaApertura = {
    apertura_id:      number;
    insti_id:         number;
    nombre:           string;
    anio:             number;
    fecha_inicio:     string;
    fecha_fin:        string;
    estado:           '1' | '0';
    matriculas_count: number;
};

export type Matricula = {
    matricula_id:  number;
    apertura_id:   number;
    estudiante_id: number;
    seccion_id:    number | null;
    anio:          number;
    estado:        '1' | '0';
    estudiante: {
        estu_id:         number;
        nombre_completo: string;
        doc_numero:      string | null;
        genero:          string | null;
    } | null;
    seccion: {
        seccion_id: number;
        nombre:     string;
    } | null;
};

export type EstudianteDisponible = {
    estu_id:         number;
    nombre_completo: string;
    doc_numero:      string | null;
};

export type SeccionOption = {
    seccion_id: number;
    nombre:     string;
};

// ── Form types ────────────────────────────────────────────────────────────────

export type AperturaFormData = {
    nombre:       string;
    anio:         string;
    fecha_inicio: string;
    fecha_fin:    string;
    estado:       string;
};

export const defaultAperturaForm: AperturaFormData = {
    nombre:       '',
    anio:         new Date().getFullYear().toString(),
    fecha_inicio: '',
    fecha_fin:    '',
    estado:       '1',
};

export type MatriculaFormData = {
    apertura_id:   string;
    estudiante_id: string;
    seccion_id:    string;
    anio:          string;
};

export const defaultMatriculaForm: MatriculaFormData = {
    apertura_id:   '',
    estudiante_id: '',
    seccion_id:    '',
    anio:          new Date().getFullYear().toString(),
};
