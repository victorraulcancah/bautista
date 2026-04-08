import { Head, Link } from '@inertiajs/react';
import { CheckCircle, Users, FileText, GraduationCap, Clock, ArrowRight, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';

const STEPS = [
    { key: 'termino', label: 'Términos', icon: FileText },
    { key: 'datos_padres', label: 'Padres', icon: Users },
    { key: 'datos_alumnos', label: 'Hijos', icon: GraduationCap },
    { key: 'estado_verifica', label: 'Verificación', icon: Clock },
    { key: 'confirmado', label: 'Confirmación', icon: CheckCircle },
];

export default function MatriculaWizard() {
    const [matricula, setMatricula] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeStep, setActiveStep] = useState(0);

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            const res = await api.get('/padre/matricula/status');
            setMatricula(res.data.matricula);
            
            // Determinar el paso actual basado en los checks del backend
            if (res.data.matricula) {
                const m = res.data.matricula;

                if (!m.termino) {
setActiveStep(0);
} else if (!m.datos_padres) {
setActiveStep(1);
} else if (!m.datos_alumnos) {
setActiveStep(2);
} else if (!m.estado_verifica) {
setActiveStep(3);
} else {
setActiveStep(4);
}
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const nextStep = async () => {
        if (!matricula) {
return;
}
        
        const stepKey = STEPS[activeStep].key;

        try {
            await api.post('/padre/matricula/step', {
                matri_padre_id: matricula.matri_padre_id,
                step: stepKey
            });
            fetchStatus();
        } catch (err) {
            alert('Error al avanzar');
        }
    };

    if (loading) {
return <div className="p-20 text-center">Cargando Asistente de Matrícula...</div>;
}

    if (!matricula) {
return (
        <div className="p-20 text-center space-y-4">
            <h1 className="text-3xl font-black text-gray-900">Sin Matrícula Asignada</h1>
            <p className="text-gray-500">No tienes un proceso de matrícula activo para este periodo.</p>
            <Link href="/padre/dashboard">
                <Button className="rounded-full px-8">Volver al Dashboard</Button>
            </Link>
        </div>
    );
}

    return (
        <div className="min-h-screen bg-[#FDFCFD] p-4 md:p-12 space-y-12 font-sans selection:bg-purple-200">
            <Head title="Proceso de Matrícula" />

            {/* Header */}
            <div className="text-center space-y-4 max-w-2xl mx-auto">
                <span className="bg-purple-100 text-purple-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                    Admisión {new Date().getFullYear()}
                </span>
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter leading-none whitespace-pre-wrap">
                    ¡Completa tu Matrícula en {'\n'}pocos pasos!
                </h1>
            </div>

            {/* Wizard Steps */}
            <div className="max-w-5xl mx-auto">
                <div className="relative flex justify-between">
                    {/* Background line */}
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 z-0" />
                    <div 
                        className="absolute top-1/2 left-0 h-1 bg-indigo-600 -translate-y-1/2 z-0 transition-all duration-500" 
                        style={{ width: `${(activeStep / (STEPS.length - 1)) * 100}%` }}
                    />
                    
                    {STEPS.map((step, i) => (
                        <div key={i} className="relative z-10 flex flex-col items-center space-y-4">
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 border-4 ${i <= activeStep ? 'bg-indigo-600 border-indigo-100 text-white shadow-xl shadow-indigo-100' : 'bg-white border-gray-100 text-gray-400'}`}>
                                <step.icon className="w-6 h-6" />
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${i <= activeStep ? 'text-indigo-600' : 'text-gray-400'}`}>
                                {step.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="max-w-4xl mx-auto bg-white rounded-[3rem] p-10 md:p-16 shadow-2xl shadow-gray-200/50 border border-gray-100 min-h-[400px] flex flex-col justify-between">
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {activeStep === 0 && (
                        <div className="space-y-6">
                            <h2 className="text-3xl font-black text-gray-900">Casi listos para empezar...</h2>
                            <p className="text-gray-500 leading-relaxed text-lg">
                                Antes de continuar, revisa y acepta los términos y condiciones de la matrícula institucional {new Date().getFullYear()}.
                                Estos términos contienen información importante sobre pagos, pensiones y el manual de convivencia.
                            </p>
                            <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 text-sm italic text-gray-400">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                            </div>
                        </div>
                    )}

                    {activeStep === 1 && (
                        <div className="space-y-6">
                            <h2 className="text-3xl font-black text-gray-900">Verificación de Datos</h2>
                            <p className="text-gray-500">Confirma que tus datos de contacto y dirección estén actualizados.</p>
                            {/* Simular Formulario */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <p className="text-[10px] font-black text-gray-400 uppercase">Nombres</p>
                                    <p className="font-bold">{matricula.nombres || '...'}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <p className="text-[10px] font-black text-gray-400 uppercase">Apellidos</p>
                                    <p className="font-bold">{matricula.apellidos || '...'}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="pt-12 flex justify-between items-center">
                    <Button variant="ghost" disabled={activeStep === 0} onClick={() => setActiveStep(activeStep - 1)} className="rounded-full px-8 font-bold text-gray-400">
                        Anterior
                    </Button>
                    <Button onClick={nextStep} className="bg-gray-900 hover:bg-black text-white rounded-full px-12 h-14 font-black uppercase tracking-widest shadow-xl">
                        {activeStep === STEPS.length - 1 ? 'Finalizar' : 'Siguiente Paso'} <ArrowRight className="ml-3 w-5 h-5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
