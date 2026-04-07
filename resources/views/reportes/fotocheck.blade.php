<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Fotocheck Estudiante</title>
    <style>
        /*
          High-End Identity Card Design
          Dimensions: 54x86 mm (153.07pt x 243.78pt)
         */
        @page { margin: 0; padding: 0; }
        body {
            margin: 0; padding: 0;
            font-family: 'Helvetica', 'Arial', sans-serif;
            background-color: #ffffff;
            width: 153.07pt; height: 243.78pt;
            position: relative;
            overflow: hidden;
        }

        /* Institutional Header (Premium Gradient) */
        .header-bg {
            position: absolute; top: 0; left: 0; width: 100%; height: 65pt;
            background: linear-gradient(180deg, #007a41 0%, #00a65a 100%);
            border-bottom: 2pt solid #eab308; /* Gold Accent Line */
            z-index: 1;
        }

        /* Decorative Background Pattern */
        .security-pattern {
            position: absolute; top: 65pt; left: 0; width: 100%; height: 178pt;
            background-color: #ffffff;
            background-image:  radial-gradient(#00a65a10 0.5pt, transparent 0.5pt);
            background-size: 10pt 10pt;
            z-index: 0;
        }

        /* Institution Header Text */
        .institution-header {
            position: absolute; top: 8pt; left: 0; width: 100%;
            text-align: center; z-index: 2;
        }
        .shield-icon {
            width: 18pt; height: 20pt; margin: 0 auto 3pt;
            background: #ffffff;
            clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
            line-height: 20pt; font-weight: 900; color: #007a41; font-size: 10pt;
        }
        .school-name {
            margin: 0; font-size: 6.5pt; font-weight: 800; color: #ffffff;
            letter-spacing: 0.5pt; text-shadow: 0 1pt 2pt rgba(0,0,0,0.2);
        }
        .doc-title {
            margin: 1pt 0 0; font-size: 5pt; font-weight: 400; color: #facc15;
            letter-spacing: 1.5pt; text-transform: uppercase;
        }

        /* Foto del Estudiante (Frame Premium) */
        .foto-outer {
            position: absolute; top: 42pt; left: 50%;
            transform: translateX(-50%);
            width: 76pt; height: 88pt;
            background: #ffffff;
            border-radius: 8pt;
            padding: 3pt;
            box-shadow: 0 4pt 12pt rgba(0,0,0,0.15);
            z-index: 5;
        }
        .foto-inner {
            width: 100%; height: 100%;
            border-radius: 5pt;
            overflow: hidden;
            background: #f1f5f9;
        }
        .foto-inner img { width: 100%; height: 100%; object-fit: cover; }
        .foto-placeholder {
            width: 100%; height: 100%; text-align: center; line-height: 88pt;
            font-size: 30pt; color: #cbd5e1; font-weight: bold;
        }

        /* Badge ALUMNO(A) */
        .badge-alumno {
            position: absolute; top: 135pt; left: 50%;
            transform: translateX(-50%);
            background: #00a65a; color: #ffffff;
            font-size: 6.5pt; font-weight: 800;
            padding: 2.5pt 14pt; border-radius: 20pt;
            box-shadow: 0 2pt 4pt rgba(0,166,90,0.3);
            z-index: 6; letter-spacing: 0.5pt;
        }

        /* Nombres y Apellidos (Clean Layout) */
        .name-container {
            position: absolute; top: 152pt; left: 0; width: 100%;
            text-align: center; z-index: 5; padding: 0 5pt; box-sizing: border-box;
        }
        .last-names {
            margin: 0; font-size: 10pt; font-weight: 800; color: #1e293b;
            line-height: 1.1; text-transform: uppercase;
        }
        .first-names {
            margin: 2pt 0 0; font-size: 8.5pt; font-weight: 400; color: #475569;
            text-transform: uppercase;
        }

        /* Data List */
        .data-list {
            position: absolute; bottom: 35pt; left: 12pt;
            width: 90pt; z-index: 5;
        }
        .data-row { margin-bottom: 3pt; }
        .data-label {
            font-size: 5.5pt; font-weight: 700; color: #94a3b8;
            text-transform: uppercase; display: block;
        }
        .data-value {
            font-size: 7.5pt; font-weight: 700; color: #334155;
            display: block; line-height: 1;
        }

        /* QR Positioning (Fixed Bottom Right) */
        .qr-frame {
            position: absolute; bottom: 35pt; right: 12pt;
            width: 34pt; height: 34pt;
            background: #ffffff; border: 1pt solid #e2e8f0;
            padding: 2pt; border-radius: 4pt; z-index: 7;
        }
        .qr-frame img { width: 100%; height: 100%; }

        /* Footer Accent */
        .footer-banner {
            position: absolute; bottom: 0; left: 0; width: 100%; height: 28pt;
            background: #f8fafc; border-top: 1pt solid #e2e8f0;
            text-align: center; z-index: 4;
        }
        .footer-text {
            line-height: 28pt; font-size: 7pt; font-weight: 800; color: #64748b;
            letter-spacing: 0.5pt;
        }
        .footer-line {
            position: absolute; bottom: 0; left: 0; width: 100%; height: 3pt;
            background: #00a65a;
        }

        /* Watermark */
        .watermark {
            position: absolute; top: 160pt; left: 10pt; font-size: 40pt;
            color: rgba(0,166,90,0.03); font-weight: 900; transform: rotate(-45deg);
            z-index: 0; pointer-events: none;
        }
    </style>
</head>
<body>

    <div class="header-bg"></div>
    <div class="security-pattern"></div>
    <div class="watermark">BAUTISTA</div>

    <div class="institution-header">
        <div class="shield-icon">B</div>
        <h1 class="school-name">{{ config('app.name', 'IEP BAUTISTA LA PASCANA') }}</h1>
        <div class="doc-title">CARNET DE MATRÍCULA</div>
    </div>

    <!-- Badge -->
    <div class="badge-alumno">ALUMNO(A)</div>

    <!-- Foto -->
    <div class="foto-outer">
        <div class="foto-inner">
            @if($fotoSrc)
                <img src="{{ $fotoSrc }}" alt="Foto Estudiante" />
            @else
                <div class="foto-placeholder">?</div>
            @endif
        </div>
    </div>

    <!-- Names Section -->
    <div class="name-container">
        <p class="last-names">
            {{ mb_strtoupper($estudiante->perfil->apellido_paterno) }}<br>
            {{ mb_strtoupper($estudiante->perfil->apellido_materno) }}
        </p>
        <p class="first-names">
            {{ mb_strtoupper($estudiante->perfil->primer_nombre . ' ' . $estudiante->perfil->segundo_nombre) }}
        </p>
    </div>

    <!-- Info List -->
    <div class="data-list">
        <div class="data-row">
            <span class="data-label">Código Estudiante</span>
            <span class="data-value">EST-{{ str_pad($estudiante->estu_id, 6, '0', STR_PAD_LEFT) }}</span>
        </div>
        <div class="data-row">
            <span class="data-label">Nro Documento</span>
            <span class="data-value">{{ $estudiante->perfil->doc_numero ?? '--------' }}</span>
        </div>
    </div>

    <!-- QR Code -->
    <div class="qr-frame">
        <img src="{{ $qrSrc }}" alt="QR Code" />
    </div>

    <!-- Footer -->
    <div class="footer-banner">
        <span class="footer-text">AÑO ACADÉMICO {{ $periodo }}</span>
        <div class="footer-line"></div>
    </div>

</body>
</html>
