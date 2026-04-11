import CalificarActividad from './CalificarActividad';

interface Props {
    actividadId: string;
}

export default function CalificarTareasPage({ actividadId }: Props) {
    return (
        <CalificarActividad 
            actividadId={parseInt(actividadId)} 
            entregasEndpoint={`/docente/actividades/${actividadId}/alumnos`}
            saveEndpoint={`/docente/actividades/${actividadId}/calificar`}
            title="Calificar Entregas"
        />
    );
}
