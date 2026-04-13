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

        /* 1. Header (Dynamic Logo/Name) */
        .header-top {
            position: absolute; top: 0; left: 0; width: 100%; height: 50pt;
            background: #ffffff;
            z-index: 10;
        }
        .header-content {
            position: absolute; top: 6pt; left: 0; width: 100%;
            text-align: center; z-index: 11;
        }
        .logo-box {
            height: 18pt; margin: 0 auto 2pt;
        }
        .logo-box img { height: 100%; }
        .school-name {
            margin: 0; font-size: 5.5pt; font-weight: 800; color: #1e3a8a;
            text-transform: uppercase; letter-spacing: 0.1pt;
        }
        .card-type {
            margin: 0; font-size: 4pt; font-weight: 400; color: #64748b;
            letter-spacing: 1.2pt; text-transform: uppercase;
        }

        /* 2. Photo (High Visual Impact) */
        .photo-outer {
            position: absolute; top: 38pt; left: 50%;
            transform: translateX(-50%);
            width: 72pt; height: 84pt;
            background: #ffffff;
            border-radius: 2pt; padding: 2.5pt;
            box-shadow: 0 2pt 5pt rgba(0,0,0,0.1);
            z-index: 20;
        }
        .photo-inner {
            width: 100%; height: 100%; border-radius: 1pt;
            overflow: hidden; background: #f8fafc;
        }
        .photo-inner img { width: 100%; height: 100%; object-fit: cover; }

        /* 3. Identity Area (Dynamic Background) */
        .main-body {
            position: absolute; top: 50pt; left: 0; width: 100%; height: 168pt;
            background-color: {{ $config->secondary_color ?? '#7b8780' }};
            z-index: 1;
        }
        .identity-area {
            position: absolute; top: 125pt; left: 0; width: 100%;
            text-align: center; z-index: 30;
        }
        .badge {
            display: inline-block; padding: 2pt 15pt;
            background: {{ $config->primary_color ?? '#2c63f2' }};
            color: #ffffff;
            font-size: 6.5pt; font-weight: 800;
            margin-bottom: 8pt; text-transform: uppercase;
            letter-spacing: 0.5pt;
        }
        .full-name {
            margin: 0; padding: 0 6pt; font-size: 10pt; font-weight: 900;
            color: {{ $config->text_color ?? '#ffffff' }};
            line-height: 1; text-transform: uppercase;
        }

        /* 4. Bottom Data */
        .bottom-data {
            position: absolute; bottom: 35pt; right: 8pt;
            width: 80pt; z-index: 40; text-align: left;
        }
        .data-row { margin-bottom: 2pt; color: {{ $config->text_color ?? '#ffffff' }}; }
        .label {
            font-size: 4.5pt; font-weight: 700; opacity: 0.8;
            text-transform: uppercase; line-height: 1;
        }
        .value {
            font-size: 6pt; font-weight: 800;
            display: block; line-height: 1; margin-top: 0.5pt;
        }

        /* 5. Fixed QR */
        .qr-anchor {
            position: absolute; bottom: 35pt; left: 10pt;
            width: 32pt; height: 32pt;
            background: #ffffff; padding: 2pt;
            box-shadow: 0 2pt 4pt rgba(0,0,0,0.1);
            z-index: 50;
        }
        .qr-anchor img { width: 100%; height: 100%; }

        /* 6. Footer bar */
        .footer-bar {
            position: absolute; bottom: 0; left: 0; width: 100%; height: 26pt;
            background: {{ $config->primary_color ?? '#2c63f2' }};
            text-align: center; z-index: 60;
        }
        .footer-text {
            line-height: 26pt; font-size: 6.5pt; font-weight: 800;
            color: #ffffff; letter-spacing: 0.5pt; text-transform: uppercase;
        }
    </style>
</head>
<body>

    <div class="header-top"></div>
    <div class="header-content">
        <div class="logo-box">
            @if($config->logo_path)
                <img src="{{ public_path('storage/' . $config->logo_path) }}" alt="Logo" />
            @else
                <img src="{{ public_path('images/logo.png') }}" alt="Logo" />
            @endif
        </div>
        <h1 class="school-name">IEP BAUTISTA LA PASCANA</h1>
        <p class="card-type">Fotocheck</p>
    </div>

    <!-- Fondo Principal Dinámico -->
    <div class="main-body"></div>

    <!-- Foto Central -->
    <div class="photo-outer">
        <div class="photo-inner">
            @if($fotoSrc)
                <img src="{{ $fotoSrc }}" alt="F" />
            @else
                <div style="text-align: center; line-height: 84pt; color: #ccc;">S/F</div>
            @endif
        </div>
    </div>

    <!-- Identidad -->
    <div class="identity-area">
        <h2 class="full-name">
            {{ mb_strtoupper($user->perfil->nombre_completo) }}
        </h2>
        <div style="margin-top: 8pt">
            <div class="badge">{{ $tipo }}</div>
        </div>
    </div>

    <!-- Datos Inferiores (Derecha) -->
    <div class="bottom-data">
        <div class="data-row">
            <span class="label">ID:</span>
            <span class="value">{{ $idDisplay }}</span>
        </div>
        <div class="data-row">
            <span class="label">DNI:</span>
            <span class="value">{{ $user->perfil->doc_numero ?? '--------' }}</span>
        </div>
        <div class="data-row">
            <span class="label">Periodo:</span>
            <span class="value">{{ date('Y') }}</span>
        </div>
    </div>

    <!-- Código QR (Izquierda) -->
    <div class="qr-anchor">
        <img src="{{ $qrSrc }}" alt="QR" />
    </div>

    <!-- Footer -->
    <div class="footer-bar">
        <div class="footer-text">{{ $config->footer_text ?? 'Periodo Académico '.date('Y') }}</div>
    </div>

</body>
</html>

</body>
</html>
