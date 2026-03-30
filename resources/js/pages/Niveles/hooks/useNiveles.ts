import type { Paginated } from '@/components/shared/ResourceTable';

export type Nivel = {
    nivel_id:      number;
    nombre_nivel:  string;
    nivel_estatus: number;
    insti_id:      number;
};

export type PaginatedNiveles = Paginated<Nivel>;

export type NivelFormData = {
    insti_id:      string;
    nombre_nivel:  string;
    nivel_estatus: string;
};

export const defaultForm: NivelFormData = {
    insti_id:      '',
    nombre_nivel:  '',
    nivel_estatus: '1',
};
