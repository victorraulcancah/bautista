import { Input } from '@/components/ui/input';
import TitleForm from '@/components/TitleForm';
import { ReqLabel, OptLabel, SELECT_CLS } from '@/components/shared/FormLabels';
import type { ContactoForm } from './types';

type Props = {
    tipo:  'padre' | 'madre' | 'apoderado';
    data:  ContactoForm;
    onChange: (k: keyof ContactoForm, v: string | boolean) => void;
};

export default function ContactoTab({ tipo, data, onChange: s }: Props) {
    const label = tipo === 'padre' ? 'Padre' : tipo === 'madre' ? 'Madre' : 'Apoderado';

    return (
        <div className="space-y-6">

            {/* Responsable de pago */}
            <label className="flex items-center gap-2 cursor-pointer w-fit bg-emerald-50/50 px-3 py-2 rounded-lg border border-emerald-100">
                <input
                    type="checkbox"
                    checked={data.es_pagador}
                    onChange={e => s('es_pagador', e.target.checked)}
                    className="h-4 w-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm font-bold text-emerald-800">Responsable de pago</span>
            </label>

            {/* Datos Personales */}
            <div>
                <TitleForm className="border-b border-neutral-100 mb-4">
                    Datos Personales del {label}
                </TitleForm>
                <div className="grid grid-cols-3 gap-x-4 gap-y-5">
                    <div className="space-y-1.5">
                        <ReqLabel>Nombre completo</ReqLabel>
                        <Input className="h-10 text-sm rounded-xl bg-neutral-50/50" value={data.nombres} onChange={e => s('nombres', e.target.value)} placeholder="Nombres..." />
                    </div>
                    <div className="space-y-1.5">
                        <ReqLabel>Apellidos</ReqLabel>
                        <Input className="h-10 text-sm rounded-xl bg-neutral-50/50" value={data.apellidos} onChange={e => s('apellidos', e.target.value)} placeholder="Apellidos..." />
                    </div>
                    <div className="space-y-1.5">
                        <OptLabel>Email</OptLabel>
                        <Input className="h-10 text-sm rounded-xl bg-neutral-50/50" type="email" value={data.email_contacto} onChange={e => s('email_contacto', e.target.value)} placeholder="correo@..." />
                    </div>
                    <div className="space-y-1.5">
                        <ReqLabel>Tipo Documento</ReqLabel>
                        <select value={data.tipo_doc} onChange={e => s('tipo_doc', e.target.value)} className={SELECT_CLS}>
                            <option value="1">DNI</option>
                            <option value="2">Pasaporte</option>
                            <option value="3">Carnet Extran.</option>
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <ReqLabel>Nro. Documento</ReqLabel>
                        <Input className="h-10 text-sm rounded-xl bg-neutral-50/50" value={data.numero_doc} onChange={e => s('numero_doc', e.target.value)} placeholder="00000000" />
                    </div>
                    <div className="space-y-1.5">
                        <ReqLabel>Familia Constituida</ReqLabel>
                        <select value={data.estado_civil} onChange={e => s('estado_civil', e.target.value)} className={SELECT_CLS}>
                            <option value="">Seleccionar…</option>
                            <option value="Juntos">Juntos</option>
                            <option value="Separados">Separados</option>
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <ReqLabel>Teléfono 1</ReqLabel>
                        <Input className="h-10 text-sm rounded-xl bg-neutral-50/50" value={data.telefono_1} onChange={e => s('telefono_1', e.target.value)} placeholder="999 999 999" />
                    </div>
                    <div className="space-y-1.5">
                        <OptLabel>Teléfono 2</OptLabel>
                        <Input className="h-10 text-sm rounded-xl bg-neutral-50/50" value={data.telefono_2} onChange={e => s('telefono_2', e.target.value)} placeholder="999 999 999" />
                    </div>
                </div>
            </div>

            {/* Datos del Hogar */}
            <div>
                <TitleForm className="border-b border-neutral-100 mb-4 mt-2">
                    Datos del Hogar
                </TitleForm>
                <div className="grid grid-cols-3 gap-x-4 gap-y-5">
                    <div className="col-span-3 space-y-1.5">
                        <ReqLabel>Dirección</ReqLabel>
                        <Input className="h-10 text-sm rounded-xl bg-neutral-50/50" value={data.direccion} onChange={e => s('direccion', e.target.value)} placeholder="Av. ..." />
                    </div>
                    <div className="space-y-1.5">
                        <ReqLabel>Departamento</ReqLabel>
                        <select value={data.departamento} onChange={e => s('departamento', e.target.value)} className={SELECT_CLS}>
                            <option value="">Seleccionar...</option>
                            <option value="Lima">Lima</option>
                            <option value="Arequipa">Arequipa</option>
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <ReqLabel>Provincia</ReqLabel>
                        <select value={data.provincia} onChange={e => s('provincia', e.target.value)} className={SELECT_CLS}>
                            <option value="">Seleccionar...</option>
                            <option value="Lima">Lima</option>
                            <option value="Callao">Callao</option>
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <ReqLabel>Distrito</ReqLabel>
                        <select value={data.distrito} onChange={e => s('distrito', e.target.value)} className={SELECT_CLS}>
                            <option value="">Seleccionar...</option>
                            <option value="Miraflores">Miraflores</option>
                            <option value="San Isidro">San Isidro</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
}
