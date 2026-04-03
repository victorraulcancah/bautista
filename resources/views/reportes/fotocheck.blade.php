<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Fotocheck Estudiante</title>
    <style>
        /*
          Dimensiones Fotocheck: 54x86 mm
          La unidad de DomPDF es en pt. Utilizaremos posiciones absolutas para precisión.
         */
        @page { margin: 0; padding: 0; }
        body {
            margin: 0; padding: 0;
            font-family: Helvetica, Arial, sans-serif;
            background-color: rgb(130, 143, 133); /* Fondo azul grisáceo anterior */
            width: 153.07pt; height: 243.78pt;
            position: relative;
        }

        /* 1. Header Blanca e Inicial */
        .header {
            position: absolute; top: 0; left: 0; width: 100%; height: 51pt;
            background-color: #ffffff;
            text-align: center;
        }
        .header-logo-container {
            position: absolute; top: 10pt; left: 50%;
            transform: translateX(-50%);
            width: 14pt; height: 14pt;
            background-color: #ffffff;
            border-radius: 50%;
            text-align: center; line-height: 14pt;
            font-size: 10pt; font-weight: bold; color: rgb(26, 69, 128);
        }
        .header h1 {
            position: absolute; top: 32pt; left: 0; width: 100%;
            margin: 0; font-size: 6.5pt; color: #000;
        }
        .header h2 {
            position: absolute; top: 40pt; left: 0; width: 100%;
            margin: 0; font-size: 5pt; font-weight: normal; color: #555;
        }

        /* 2. Círculos Decorativos (Simulados con divs en DomPDF) */
        .circle-1 {
            position: absolute; top: 34pt; right: 25pt; width: 22pt; height: 22pt;
            background-color: rgba(255, 255, 255, 0.05); border-radius: 50%;
        }
        .circle-2 {
            position: absolute; bottom: 20pt; left: 22pt; width: 17pt; height: 17pt;
            background-color: rgba(255, 255, 255, 0.05); border-radius: 50%;
        }

        /* 3. Marco y Foto del Estudiante */
        .foto-container {
            position: absolute;
            top: 55pt; left: 50%;
            transform: translateX(-50%);
            width: 68pt; height: 68pt;
            background-color: #fff;
            border: 1px solid #ccc;
            padding: 1.5pt;
        }
        .foto-container img {
            width: 100%; height: 100%; object-fit: cover;
        }

        /* 4. Caja de Información principal */
        .info-box {
            position: absolute;
            top: 125pt; left: 5.6pt; width: 141.7pt; height: 68pt;
            background-color: rgb(130, 143, 133);
            border: 1px solid rgba(255, 255, 255, 0.4);
        }
        
        /* 5. Nombres (Centrados arriba de la caja) */
        .nombres {
            position: absolute;
            top: 130pt; left: 0; width: 100%;
            text-align: center; color: #fff;
            font-size: 8pt; font-weight: bold;
            line-height: 1.2;
            padding: 0 10pt;
            box-sizing: border-box;
        }

        /* 6. Píldora ALUMNO */
        .badge-alumno {
            position: absolute;
            top: 150pt; left: 50%;
            transform: translateX(-50%);
            width: 68pt; height: 10pt;
            background-color: rgb(37, 99, 235);
            color: #fff; font-size: 6pt; font-weight: bold; text-align: center;
            line-height: 10pt;
        }

        /* 7. Datos y QR */
        .data-grid {
            position: absolute;
            top: 165pt; left: 45pt;
            color: #fff; font-size: 6pt;
        }
        .data-grid span.bold { font-weight: bold; }
        .data-grid div { margin-bottom: 2pt; }

        .qr-icon {
            position: absolute;
            top: 153.5pt; left: 12pt;
            width: 28pt; height: 28pt;
            background: #fff; border: 1px solid #fff;
        }

        /* 8. Barras Footer */
        .footer-banner {
            position: absolute;
            top: 198pt; left: 0; width: 100%; height: 14pt;
            background-color: rgb(37, 99, 237);
            color: #fff; font-size: 6pt; font-weight: bold; text-align: center;
            line-height: 14pt;
        }

        .stripe-1 { position: absolute; top: 212pt; left: 0; width: 100%; height: 5.6pt; background-color: #fff; }
        .stripe-2 { position: absolute; top: 217pt; left: 0; width: 100%; height: 5.6pt; background-color: rgb(37, 99, 237); }
        .stripe-3 { position: absolute; top: 222pt; left: 0; width: 100%; height: 21.7pt; background-color: rgb(37, 99, 237); }
    </style>
</head>
<body>

    <!-- Header -->
    <div class="header">
        <!-- Puedes usar logo real poniendo: <img src="file://path" /> -->
        <div class="header-logo-container">E</div>
        <h1>IEP BAUTISTA LA PASCANA</h1>
        <h2>FOTOCHECK</h2>
    </div>

    <!-- Decoraciones -->
    <div class="circle-1"></div>
    <div class="circle-2"></div>

    <!-- Foto -->
    <div class="foto-container">
        @if($fotoSrc)
            <img src="{{ $fotoSrc }}" alt="Foto Estudiante" />
        @else
            <div style="width:100%; height:100%; background:#e0e0e0;"></div>
        @endif
    </div>

    <!-- Info Box -->
    <div class="info-box"></div>
    
    <div class="nombres">
        <div>{{ mb_strtoupper($estudiante->perfil->primer_nombre . ' ' . $estudiante->perfil->segundo_nombre) }}</div>
        <div>{{ mb_strtoupper($estudiante->perfil->apellido_paterno . ' ' . $estudiante->perfil->apellido_materno) }}</div>
    </div>

    <div class="badge-alumno">ALUMNO(A)</div>

    <!-- QR -->
    <img src="{{ $qrSrc }}" class="qr-icon" />

    <!-- Datos Secundarios -->
    <div class="data-grid">
        <div><span class="bold">STUDENT ID:</span> EST-{{ str_pad($estudiante->estu_id, 6, '0', STR_PAD_LEFT) }}</div>
        <div><span class="bold">DNI:</span> {{ $estudiante->perfil->doc_numero ?? 'N/A' }}</div>
        <div>
            <span class="bold">MATR.:</span> 
            {{-- Podríamos traer el grado de las matrículas pero si no está mandamos estandar --}}
            ACTIVA
        </div>
        <div><span class="bold">TEL:</span> {{ $estudiante->perfil->telefono_pricipal ?? 'N/A' }}</div>
    </div>

    <!-- Footer -->
    <div class="footer-banner">
        Año Académico {{ $periodo }}
    </div>
    <div class="stripe-1"></div>
    <div class="stripe-2"></div>
    <div class="stripe-3"></div>

</body>
</html>
