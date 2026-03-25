import type { Paginated } from '@/components/shared/ResourceTable';

export type Nivel = {
    nivel_id:     number;
    nombre_nivel: string;
};

export type Grado = {
    grado_id:     number;
    nivel_id:     number;
    nombre_grado: string;
    abreviatura:  string | null;
    nivel:        Nivel | null;
};

export type PaginatedGrados = Paginated<Grado>;

export type GradoFormData = {
    nivel_id:     string;
    nombre_grado: string;
    abreviatura:  string;
};

export const defaultForm: GradoFormData = {
    nivel_id:     '',
    nombre_grado: '',
    abreviatura:  '',
};
