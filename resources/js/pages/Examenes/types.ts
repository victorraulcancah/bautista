export type TipoActividad = { tipo_id: number; nombre: string };

export type Alternativa = {
    alternativa_id: number;
    contenido:      string;
    es_correcta:    boolean;
};

export type Pregunta = {
    pregunta_id:     number;
    cabecera:        string;
    cuerpo:          string | null;
    tipo_respuesta:  string;
    valor_nota:      number;
    recurso_imagen?: string | null;
    alternativas:    Alternativa[];
};

export type Actividad = {
    actividad_id:      number;
    id_curso:          number;
    id_tipo_actividad: number;
    nombre_actividad:  string;
    descripcion_corta: string | null;
    fecha_inicio:      string | null;
    fecha_cierre:      string | null;
    estado:            string;
    es_calificado:     string;
    tipo?:             TipoActividad;
    cuestionario?: null | {
        cuestionario_id:   number;
        duracion:          number;
        mostrar_respuesta: string;
        preguntas:         Pregunta[];
    };
};
