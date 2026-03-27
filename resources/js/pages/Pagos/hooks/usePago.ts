export type EstudiantePagador = {
    estu_id:         number;
    nombre_completo: string;
    mensualidad:     string; // decimal string
};

export type Pagador = {
    id_usuario:   number;
    nombres:      string;
    apellidos:    string;
    telefono_1:   string | null;
    numero_doc:   string | null;
    mensualidad:  string | null;
    estu_id:      number;
    id_contacto:  number;
    pagos_count:  number;
};

export type Pago = {
    pag_id:       number;
    contacto_id:  number;
    estudiante_id:number;
    pag_anual:    number;
    pag_mes:      string;
    pag_monto:    string;
    pag_nombre1:  string | null;
    pag_otro1:    string;
    pag_nombre2:  string | null;
    pag_otro2:    string;
    total:        string;
    pag_notifica: 'SI' | 'NO';
    pag_fecha:    string | null;
    estatus:      0 | 1;
};

export type PagoFormData = {
    contacto_id:   string;
    estudiante_id: string;
    pag_anual:     string;
    pag_mes:       string;
    pag_monto:     string;
    pag_nombre1:   string;
    pag_otro1:     string;
    pag_nombre2:   string;
    pag_otro2:     string;
    pag_notifica:  string;
    pag_fecha:     string;
};

export type PagoUpdateData = {
    pag_monto:    string;
    pag_nombre1:  string;
    pag_otro1:    string;
    pag_nombre2:  string;
    pag_otro2:    string;
    pag_notifica: string;
    pag_fecha:    string;
};

export const MESES = [
    'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
    'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE',
] as const;

export const defaultPagoForm = (
    contactoId: number,
    estudianteId: number,
): PagoFormData => ({
    contacto_id:   contactoId.toString(),
    estudiante_id: estudianteId.toString(),
    pag_anual:     new Date().getFullYear().toString(),
    pag_mes:       MESES[new Date().getMonth()],
    pag_monto:     '',
    pag_nombre1:   '',
    pag_otro1:     '',
    pag_nombre2:   '',
    pag_otro2:     '',
    pag_notifica:  'NO',
    pag_fecha:     new Date().toISOString().slice(0, 10),
});

export const defaultPagoUpdateForm = (pago: Pago): PagoUpdateData => ({
    pag_monto:    pago.pag_monto,
    pag_nombre1:  pago.pag_nombre1 ?? '',
    pag_otro1:    pago.pag_otro1,
    pag_nombre2:  pago.pag_nombre2 ?? '',
    pag_otro2:    pago.pag_otro2,
    pag_notifica: pago.pag_notifica,
    pag_fecha:    pago.pag_fecha ?? '',
});