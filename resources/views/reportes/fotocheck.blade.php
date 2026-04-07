<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Fotocheck Estudiante</title>
    <style>
        /* Modern Vertical ID Card Spec (54x86mm) */
        @page { margin: 0; padding: 0; }
        body {
            margin: 0; padding: 0;
            font-family: 'Helvetica', 'Arial', sans-serif;
            background-color: #ffffff;
            width: 153.07pt; height: 243.78pt;
            position: relative;
            overflow: hidden;
            color: #1e293b;
            line-height: 1.2;
        }

        /* 1. Header (Deep Emerald Gradient) */
        .header-top {
            position: absolute; top: 0; left: 0; width: 100%; height: 50pt;
            background: linear-gradient(135deg, #007a41 0%, #00a65a 100%);
            border-bottom: 1.5pt solid #eab308;
            z-index: 10;
        }
        .header-content {
            position: absolute; top: 6pt; left: 0; width: 100%;
            text-align: center; z-index: 11;
        }
        .shield {
            width: 14pt; height: 16pt; margin: 0 auto;
            background: #ffffff;
            clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
            line-height: 16pt; font-weight: bold; color: #007a41; font-size: 8pt;
        }
        .school-name {
            margin: 2pt 0 0; font-size: 5.5pt; font-weight: 800; color: #ffffff;
            text-transform: uppercase; letter-spacing: 0.2pt;
        }
        .card-type {
            margin: 0; font-size: 4pt; font-weight: 400; color: #eab308;
            letter-spacing: 1.2pt; text-transform: uppercase;
        }

        /* 2. Photo (High Visual Impact) */
        .photo-outer {
            position: absolute; top: 38pt; left: 50%;
            transform: translateX(-50%);
            width: 72pt; height: 84pt;
            background: #ffffff;
            border-radius: 6pt; padding: 2.5pt;
            box-shadow: 0 3pt 8pt rgba(0,0,0,0.12);
            z-index: 20;
        }
        .photo-inner {
            width: 100%; height: 100%; border-radius: 4pt;
            overflow: hidden; background: #f8fafc;
        }
        .photo-inner img { width: 100%; height: 100%; object-fit: cover; }
        .photo-placeholder {
            width: 100%; height: 100%; text-align: center; line-height: 84pt;
            font-size: 24pt; color: #cbd5e1; font-weight: bold;
        }

        /* 3. Identity Section */
        .identity-area {
            position: absolute; top: 125pt; left: 0; width: 100%;
            text-align: center; z-index: 30;
        }
        .badge {
            display: inline-block; padding: 1.5pt 10pt;
            background: #00a65a; color: #ffffff;
            font-size: 6pt; font-weight: 800; border-radius: 10pt;
            margin-bottom: 6pt; text-transform: uppercase;
        }
        .last-names {
            margin: 0; padding: 0 4pt; font-size: 10pt; font-weight: 900;
            color: #0f172a; line-height: 1.1; text-transform: uppercase;
            letter-spacing: -0.2pt;
        }
        .first-names {
            margin: 2pt 0 0; font-size: 7.5pt; font-weight: 500;
            color: #64748b; text-transform: uppercase;
            letter-spacing: 0.1pt;
        }

        /* 4. Bottom Data (Avoiding Collisions) */
        .bottom-data {
            position: absolute; bottom: 32pt; left: 10pt;
            width: 95pt; z-index: 40;
        }
        .data-row { margin-bottom: 3.5pt; }
        .label {
            font-size: 5pt; font-weight: 700; color: #94a3b8;
            text-transform: uppercase; line-height: 1;
        }
        .value {
            font-size: 7.5pt; font-weight: 700; color: #334155;
            display: block; line-height: 1.1; margin-top: 0.5pt;
        }

        /* 5. Fixed QR (Isolated) */
        .qr-anchor {
            position: absolute; bottom: 32pt; right: 8pt;
            width: 32pt; height: 32pt;
            background: #ffffff; border: 0.5pt solid #e2e8f0;
            padding: 2pt; border-radius: 3pt; z-index: 50;
        }
        .qr-anchor img { width: 100%; height: 100%; }

        /* 6. Footer (Clean Bottom) */
        .footer-bar {
            position: absolute; bottom: 0; left: 0; width: 100%; height: 26pt;
            background: #f1f5f9; border-top: 0.5pt solid #e2e8f0;
            text-align: center; z-index: 5;
        }
        .footer-text {
            line-height: 26pt; font-size: 6.5pt; font-weight: 800;
            color: #64748b; letter-spacing: 0.3pt;
        }
        .footer-line {
            position: absolute; bottom: 0; left: 0; width: 100%; height: 3pt;
            background: #00a65a;
        }

        /* Background Effects */
        .bg-pattern {
            position: absolute; top: 50pt; left: 0; width: 100%; height: 160pt;
            background: radial-gradient(circle at 50% 50%, #00a65a08 0.5pt, transparent 0.5pt);
            background-size: 8pt 8pt; z-index: 0;
        }
        .watermark {
            position: absolute; top: 155pt; left: 15pt;
            font-size: 30pt; font-weight: 900; color: #00a65a03;
            transform: rotate(-15deg); z-index: 1; pointer-events: none;
        }
    </style>
</head>
<body>

    <div class="header-top"></div>
    <div class="header-content">
        <div class="shield">B</div>
        <h1 class="school-name">{{ config('app.name', 'BAUTISTA LA PASCANA') }}</h1>
        <p class="card-type">Cédula de Identidad Escolar</p>
    </div>

    <div class="bg-pattern"></div>
    <div class="watermark">INSTITUCIONAL</div>

    <!-- Foto Central -->
    <div class="photo-outer">
        <div class="photo-inner">
            @if($fotoSrc)
                <img src="{{ $fotoSrc }}" alt="F" />
            @else
                <div class="photo-placeholder">?</div>
            @endif
        </div>
    </div>

    <!-- Identidad -->
    <div class="identity-area">
        <div class="badge">ALUMNO(A)</div>
        <h2 class="last-names">
            {{ mb_strtoupper($estudiante->perfil->apellido_paterno) }}<br>
            {{ mb_strtoupper($estudiante->perfil->apellido_materno) }}
        </h2>
        <p class="first-names">
            {{ mb_strtoupper($estudiante->perfil->primer_nombre . ' ' . $estudiante->perfil->segundo_nombre) }}
        </p>
    </div>

    <!-- Datos Inferiores -->
    <div class="bottom-data">
        <div class="data-row">
            <span class="label">ID Sistema</span>
            <span class="value">EST-{{ str_pad($estudiante->estu_id, 6, '0', STR_PAD_LEFT) }}</span>
        </div>
        <div class="data-row">
            <span class="label">Nro Documento</span>
            <span class="value">{{ $estudiante->perfil->doc_numero ?? '--------' }}</span>
        </div>
    </div>

    <!-- Código QR (Anclado) -->
    <div class="qr-anchor">
        <img src="{{ $qrSrc }}" alt="QR" />
    </div>

    <!-- Footer -->
    <div class="footer-bar">
        <div class="footer-text">VIGENTE PERIODO {{ $periodo }}</div>
        <div class="footer-line"></div>
    </div>

</body>
</html>
