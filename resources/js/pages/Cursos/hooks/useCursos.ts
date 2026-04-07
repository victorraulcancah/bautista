import type { Paginated } from '@/components/shared/ResourceTable';

export type NivelOption = {
    nivel_id:     number;
    nombre_nivel: string;
};

export type GradoOption = {
    grado_id:     number;
    nombre_grado: string;
};

export type Curso = {
    curso_id:            number;
    nombre:              string;
    descripcion:         string | null;
    estado:              '1' | '0';
    nivel_academico_id:  number | null;
    grado_academico:     number | null;
    nivel:               NivelOption | null;
    grado:               GradoOption | null;
    logo:                string | null;
};

export type PaginatedCursos = Paginated<Curso>;

export type CursoFormData = {
    nombre:             string;
    descripcion:        string;
    nivel_academico_id: string;
    grado_academico:    string;
    estado:             string;
    logo:               any;
};

export const defaultForm: CursoFormData = {
    nombre:             '',
    descripcion:        '',
    nivel_academico_id: '',
    grado_academico:    '',
    estado:             '1',
    logo:               null,
};
