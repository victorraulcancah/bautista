export type ArchivoClase = {
    archivo_id: number;
    nombre:     string;
    path:       string;
    tipo:       string | null;
    tamanio:    number | null;
    url:        string;
};

export type Clase = {
    clase_id:    number;
    unidad_id:   number;
    titulo:      string;
    descripcion: string | null;
    orden:       number;
    estado:      '1' | '0';
    archivos:    ArchivoClase[];
};

export type Unidad = {
    unidad_id:   number;
    curso_id:    number;
    titulo:      string;
    descripcion: string | null;
    orden:       number;
    estado:      '1' | '0';
    clases:      Clase[];
};

// ── Form types ────────────────────────────────────────────────────────────────

export type UnidadFormData = {
    curso_id:    string;
    titulo:      string;
    descripcion: string;
};

export type ClaseFormData = {
    unidad_id:   string;
    titulo:      string;
    descripcion: string;
};

export const defaultUnidadForm = (cursoId: number): UnidadFormData => ({
    curso_id:    cursoId.toString(),
    titulo:      '',
    descripcion: '',
});

export const defaultClaseForm = (unidadId: number): ClaseFormData => ({
    unidad_id:   unidadId.toString(),
    titulo:      '',
    descripcion: '',
});

export function formatTamanio(bytes: number | null): string {
    if (!bytes) {
return '';
}

    if (bytes < 1024) {
return `${bytes} B`;
}

    if (bytes < 1024 * 1024) {
return `${(bytes / 1024).toFixed(1)} KB`;
}

    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
