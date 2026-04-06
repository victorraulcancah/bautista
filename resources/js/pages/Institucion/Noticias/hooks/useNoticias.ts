export type Noticia = {
    not_id:                number;
    insti_id:              number;
    not_titulo:            string;
    not_resumen:           string | null;
    not_mensaje:           string | null;
    not_contenido_html:    string | null;
    not_cita_autoridad:    string | null;
    not_cita_estudiante:   string | null;
    not_multimedia_json:   string | null;
    not_lugar_evento:      string | null;
    not_fecha_evento:      string | null;
    not_fecha_publicacion: string | null;
    not_fecha_expiracion:  string | null;
    not_fecha:             string | null;
    not_estatus:           number;
    autor:                 string | null;
    url:                   string | null;
};

export type NoticiaFormData = {
    not_titulo:            string;
    not_resumen:           string;
    not_mensaje:           string;
    not_contenido_html:    string;
    not_cita_autoridad:    string;
    not_cita_estudiante:   string;
    not_lugar_evento:      string;
    not_fecha_evento:      string;
    not_fecha_publicacion: string;
    not_fecha_expiracion:  string;
    autor:                 string;
};

export const defaultForm: NoticiaFormData = {
    not_titulo:            '',
    not_resumen:           '',
    not_mensaje:           '',
    not_contenido_html:    '',
    not_cita_autoridad:    '',
    not_cita_estudiante:   '',
    not_lugar_evento:      '',
    not_fecha_evento:      '',
    not_fecha_publicacion: '',
    not_fecha_expiracion:  '',
    autor:                 '',
};
