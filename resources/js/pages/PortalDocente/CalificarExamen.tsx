import CalificarActividad from './CalificarActividad';

interface Props {
    actividadId: string;
}

export default function CalificarExamenPage({ actividadId }: Props) {
    return (
        <CalificarActividad 
            actividadId={parseInt(actividadId)} 
            entregasEndpoint={`/docente/actividades/${actividadId}/examenes`}
            saveEndpoint={`/docente/actividades/${actividadId}/calificar-examen`}
            title="Calificar Evaluación"
        />
    );
}
