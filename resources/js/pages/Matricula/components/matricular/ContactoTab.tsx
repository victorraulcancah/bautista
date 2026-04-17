import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ReqLabel, OptLabel, SELECT_CLS } from '@/components/shared/FormLabels';
import TitleForm from '@/components/TitleForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';
import type { ContactoForm } from './types';


type Props = {
    tipo:  'padre' | 'madre' | 'apoderado';
    data:  ContactoForm;
    onChange: (k: keyof ContactoForm, v: string | boolean) => void;
    onSearch: (dni: string) => void;
    searching?: boolean;
};

export default function ContactoTab({ tipo, data, onChange: s, onSearch, searching }: Props) {
    const label = tipo === 'padre' ? 'Padre' : tipo === 'madre' ? 'Madre' : 'Apoderado';

    const [departamentos, setDepartamentos] = useState<{dep_cod: string; dep_nombre: string}[]>([]);
    const [provincias, setProvincias]       = useState<{pro_cod: string; pro_nombre: string}[]>([]);
    const [distritos, setDistritos]         = useState<{dis_codigo: string; dis_nombre: string}[]>([]);

    // Cargar departamentos al montar
    useEffect(() => {
        api.get('/ubigeo/departamentos').then(r => setDepartamentos(r.data));
    }, []);

    // Cargar provincias cuando cambia departamento
    useEffect(() => {
        if (!data.departamento) { setProvincias([]); setDistritos([]); return; }
        api.get(`/ubigeo/provincias/${data.departamento}`).then(r => setProvincias(r.data));
        setDistritos([]);
    }, [data.departamento]);

    // Cargar distritos cuando cambia provincia
    useEffect(() => {
        if (!data.departamento || !data.provincia) { setDistritos([]); return; }
        api.get(`/ubigeo/distritos/${data.departamento}/${data.provincia}`).then(r => setDistritos(r.data));
    }, [data.provincia]);

    // Auto-search when DNI reaches 8 digits
    useEffect(() => {
        if (data.tipo_doc === '1' && data.numero_doc.length === 8) {
            onSearch(data.numero_doc);
        }
    }, [data.numero_doc, data.tipo_doc]);

    return (
        <div className="space-y-6">
            
            {/* Cabecera: Responsable y Documento */}
            <div className="flex flex-wrap items-end gap-4 bg-emerald-50/30 p-4 rounded-xl border border-emerald-100/50">
                <label className="flex items-center gap-2 cursor-pointer bg-white px-4 h-10 rounded-xl border border-emerald-100 shadow-sm shrink-0">
                    <input
                        type="checkbox"
                        checked={data.es_pagador}
                        onChange={e => s('es_pagador', e.target.checked)}
                        className="h-4 w-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm font-bold text-emerald-800">Responsable de pago</span>
                </label>

                <div className="flex-1 min-w-[200px] space-y-1.5">
                    <ReqLabel>Tipo Documento</ReqLabel>
                    <select value={data.tipo_doc} onChange={e => s('tipo_doc', e.target.value)} className={SELECT_CLS}>
                        <option value="1">DNI</option>
                        <option value="2">Pasaporte</option>
                        <option value="3">Carnet Extran.</option>
                    </select>
                </div>

                <div className="flex-[1.5] min-w-[200px] space-y-1.5">
                    <ReqLabel>Nro. Documento</ReqLabel>
                    <div className="flex gap-2">
                        <Input 
                            className="h-10 text-sm rounded-xl bg-white flex-1" 
                            value={data.numero_doc} 
                            onChange={e => s('numero_doc', e.target.value)} 
                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), onSearch(data.numero_doc))}
                            placeholder="00000000" 
                        />
                        <Button
                            type="button" size="sm"
                            onClick={() => onSearch(data.numero_doc)}
                            disabled={searching || !data.numero_doc || data.tipo_doc !== '1'}
                            className="bg-[#00a65a] hover:bg-[#008d4c] text-white h-10 px-3 shrink-0"
                        >
                            <Search className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

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
                        <select value={data.departamento}
                            onChange={e => { s('departamento', e.target.value); s('provincia', ''); s('distrito', ''); }}
                            className={SELECT_CLS}>
                            <option value="">Seleccionar...</option>
                            {departamentos.map(d => (
                                <option key={d.dep_cod} value={d.dep_cod}>{d.dep_nombre}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <ReqLabel>Provincia</ReqLabel>
                        <select value={data.provincia}
                            onChange={e => { s('provincia', e.target.value); s('distrito', ''); }}
                            className={SELECT_CLS}
                            disabled={!data.departamento}>
                            <option value="">{data.departamento ? 'Seleccionar...' : 'Primero selecciona departamento'}</option>
                            {provincias.map(p => (
                                <option key={p.pro_cod} value={p.pro_cod}>{p.pro_nombre}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <ReqLabel>Distrito</ReqLabel>
                        <select value={data.distrito}
                            onChange={e => s('distrito', e.target.value)}
                            className={SELECT_CLS}
                            disabled={!data.provincia}>
                            <option value="">{data.provincia ? 'Seleccionar...' : 'Primero selecciona provincia'}</option>
                            {distritos.map(d => (
                                <option key={d.dis_codigo} value={d.dis_codigo}>{d.dis_nombre}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
}
