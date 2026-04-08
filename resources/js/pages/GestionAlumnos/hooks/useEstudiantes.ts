export type Perfil = {
    perfil_id:        number;
    primer_nombre:    string;
    segundo_nombre:   string | null;
    apellido_paterno: string;
    apellido_materno: string | null;
    genero:           'M' | 'F' | null;
    doc_numero:       string | null;
    fecha_nacimiento: string | null;
    direccion:        string | null;
    telefono:         string | null;
};

export type UserAuth = {
    id:       number;
    username: string;
    email:    string | null;
};

export type Estudiante = {
    estu_id:              number;
    insti_id:             number;
    estado:               '1' | '0' | '5';
    colegio:              string | null;
    neurodivergencia:     string | null;
    terapia_ocupacional:  string | null;
    edad:                 number | null;
    talla:                string | null;
    peso:                 string | null;
    seguro:               string | null;
    mensualidad:          string | null;
    fecha_ingreso:        string | null;
    created_at:           string;
    perfil:               Perfil | null;
    user:                 UserAuth | null;
};

export type PaginatedEstudiantes = {
    data:          Estudiante[];
    current_page:  number;
    last_page:     number;
    per_page:      number;
    total:         number;
    from:          number;
    to:            number;
};

export type EstudianteFormData = {
    username:             string;
    email:                string;
    primer_nombre:        string;
    segundo_nombre:       string;
    apellido_paterno:     string;
    apellido_materno:     string;
    genero:               'M' | 'F' | '';
    fecha_nacimiento:     string;
    direccion:            string;
    telefono:             string;
    colegio:              string;
    neurodivergencia:     string;
    terapia_ocupacional:  string;
    edad:                 string;
    talla:                string;
    peso:                 string;
    seguro:               string;
    mensualidad:          string;
    fecha_ingreso:        string;
    estado?:              string;
};

export const defaultForm: EstudianteFormData = {
    username:            '',
    email:               '',
    primer_nombre:       '',
    segundo_nombre:      '',
    apellido_paterno:    '',
    apellido_materno:    '',
    genero:              '',
    fecha_nacimiento:    '',
    direccion:           '',
    telefono:            '',
    colegio:             '',
    neurodivergencia:    '',
    terapia_ocupacional: '',
    edad:                '',
    talla:               '',
    peso:                '',
    seguro:              '',
    mensualidad:         '',
    fecha_ingreso:       '',
};

export function nombreCompleto(e: Estudiante): string {
    if (e.perfil) {
        return [e.perfil.primer_nombre, e.perfil.apellido_paterno, e.perfil.apellido_materno]
            .filter(Boolean).join(' ');
    }

    return e.user?.username ?? '—';
}

export function dniEstudiante(e: Estudiante): string {
    return e.perfil?.doc_numero ?? e.user?.username ?? '—';
}
