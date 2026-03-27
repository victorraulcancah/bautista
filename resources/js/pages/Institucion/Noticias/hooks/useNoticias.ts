export type Noticia = {
    not_id:      number;
    insti_id:    number;
    not_titulo:  string;
    not_mensaje: string | null;
    not_fecha:   string | null;
    not_estatus: number;
    url:         string | null;
};

export type NoticiaFormData = {
    not_titulo:  string;
    not_mensaje: string;
    not_fecha:   string;
};

export const defaultForm: NoticiaFormData = {
    not_titulo:  '',
    not_mensaje: '',
    not_fecha:   '',
};
