import type { Paginated } from '@/components/shared/ResourceTable';

export type GradoOption = {
    grado_id:     number;
    nombre_grado: string;
};

export type Seccion = {
    seccion_id:  number;
    id_grado:    number;
    nombre:      string;
    abreviatura: string | null;
    cnt_alumnos: number;
    horario:     string | null;
    grado:       GradoOption | null;
};

export type PaginatedSecciones = Paginated<Seccion>;

export type SeccionFormData = {
    id_grado:    string;
    nombre:      string;
    abreviatura: string;
    cnt_alumnos: string;
    horario:     string;
};

export const defaultForm: SeccionFormData = {
    id_grado:    '',
    nombre:      '',
    abreviatura: '',
    cnt_alumnos: '',
    horario:     '',
};
