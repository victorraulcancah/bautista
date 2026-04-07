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
    matricula_id:    number;
    apertura_id:     number;
    estu_id:         number;
    seccion_id:      number | null;
    anio:            number;
    estado:          '1' | '0';
    fecha_matricula: string | null;
    estudiante: {
        estu_id:          number;
        primer_nombre:    string | null;
        segundo_nombre:   string | null;
        apellido_paterno: string | null;
        apellido_materno: string | null;
        nombre_completo:  string;
        doc_numero:       string | null;
        genero:           string | null;
        user_id:          number | null;
        estado_user:      string | null;
    } | null;
    seccion: {
        seccion_id: number;
        nombre:     string;
        grado: {
            grado_id:     number;
            nombre_grado: string;
        } | null;
    } | null;
};

export type NivelCount = {
    nivel_id:     number;
    nombre_nivel: string;
    total:        number;
};

export type EstudianteDisponible = {
    estu_id:         number;
    nombre_completo: string;
    doc_numero:      string | null;
};

export type GradoOption = {
    grado_id:     number;
    nombre_grado: string;
    nivel_id:     number;
};

export type SeccionOption = {
    seccion_id: number;
    nombre:     string;
    id_grado:   number;
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
    estu_id:       string;
    seccion_id:    string;
    anio:          string;
};

export const defaultMatriculaForm: MatriculaFormData = {
    apertura_id:   '',
    estu_id:       '',
    seccion_id:    '',
    anio:          new Date().getFullYear().toString(),
};
