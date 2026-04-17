<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Fotocheck Institucional</title>
    <style>
        /* Sincronizado con medidas.php (54mm x 85.6mm) */
        @page {
            margin: 0;
            padding: 0;
            size: 54mm 85.6mm;
        }
        
        body {
            margin: 0;
            padding: 0;
            width: 54mm;
            height: 85.6mm;
            font-family: 'Helvetica', sans-serif;
            background-color: #ffffff;
            position: relative;
            overflow: hidden;
        }

        /* 1. Cabecera (18mm) */
        .header {
            position: absolute;
            top: 0;
            left: 0;
            width: 54mm;
            height: 18mm;
            background-color: #ffffff;
            text-align: center;
            z-index: 10;
        }

        .logo-container {
            width: 30mm;
            height: 11mm;
            margin: 2mm auto 1mm;
            display: block;
        }

        .logo-container img {
            max-width: 100%;
            max-height: 100%;
        }

        .school-name {
            font-size: 5pt;
            font-weight: 900;
            color: {{ $config->primary_color ?? '#1e3a8a' }};
            text-transform: uppercase;
            margin: 0;
            letter-spacing: 0.2pt;
        }

        /* 2. Área Central (Color Secundario) */
        .main-background {
            position: absolute;
            top: 18mm;
            left: 0;
            width: 54mm;
            height: 63.6mm; /* Ajustado para llegar hasta el footer exacto (85.6 - 18 - 4) */
            background-color: {{ $config->secondary_color ?? '#7b8780' }};
            z-index: 1;
        }

        /* 3. Foto (32mm x 32mm) */
        .photo-frame {
            position: absolute;
            top: 19mm;
            left: 50%;
            margin-left: -12mm; /* Centrado para 24mm de ancho */
            width: 24mm;
            height: 24mm;
            background-color: #ffffff;
            border: 0.5mm solid #ffffff;
            border-radius: 1mm;
            z-index: 20;
            overflow: hidden;
        }

        .photo-frame img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        /* 4. Identidad y Datos */
        .identity-container {
            position: absolute;
            top: 45mm;
            left: 0;
            width: 54mm;
            text-align: center;
            z-index: 30;
        }

        .badge {
            display: inline-block;
            background-color: {{ $config->primary_color ?? '#2c63f2' }};
            color: #ffffff;
            font-size: 6pt;
            font-weight: 900;
            padding: 1.5pt 10pt;
            text-transform: uppercase;
            margin-bottom: 2mm;
        }

        .full-name {
            font-size: 6pt;
            font-weight: 900;
            color: {{ $config->text_color ?? '#ffffff' }};
            text-transform: uppercase;
            margin: 0;
            padding: 0 2mm;
            line-height: 1.1;
        }

        /* 5. Datos Inferiores y QR */
        .bottom-area {
            position: absolute;
            top: 60mm;
            left: 4mm;
            width: 46mm;
            height: 14mm;
            z-index: 40;
        }

        .qr-code {
            position: absolute;
            left: 0;
            top: 0;
            width: 14mm;
            height: 14mm;
            background-color: #ffffff;
            padding: 1mm;
        }

        .qr-code img {
            width: 100%;
            height: 100%;
        }

        .metadata {
            position: absolute;
            left: 17mm;
            top: 0;
            width: 29mm;
            text-align: left;
        }

        .data-row {
            margin-bottom: 1pt;
        }

        .label {
            font-size: 3.5pt;
            font-weight: 800;
            color: {{ $config->text_color ?? '#ffffff' }};
            opacity: 0.9;
            text-transform: uppercase;
        }

        .value {
            font-size: 5.5pt;
            font-weight: 900;
            color: {{ $config->text_color ?? '#ffffff' }};
        }

        table.metadata-table {
            width: 100%;
            border-collapse: collapse;
        }

        table.metadata-table td {
            padding: 0;
            margin: 0;
            vertical-align: top;
            line-height: 1.1;
        }

        table.metadata-table td.label-cell {
            width: 14mm;
        }

        /* 6. Footer (8.6mm) */
        .footer {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 54mm;
            height: 4mm;
            background-color: {{ $config->primary_color ?? '#2c63f2' }};
            color: #ffffff;
            text-align: center;
            line-height: 4mm;
            z-index: 50;
        }

        .footer-text {
            font-size: 5.5pt;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.5pt;
        }
    </style>
</head>
<body>

    <div class="header">
        <div class="logo-container">
            @if($config->logo_path)
                <img src="{{ public_path('storage/' . $config->logo_path) }}" alt="Logo">
            @else
                <img src="{{ public_path('images/logo.png') }}" alt="Logo">
            @endif
        </div>
        <p class="school-name">IEP BAUTISTA LA PASCANA</p>
    </div>

    <div class="main-background"></div>

    <div class="photo-frame">
        @if($fotoSrc)
            <img src="{{ $fotoSrc }}" alt="Foto">
        @else
            <div style="width: 100%; height: 100%; background: #eee;"></div>
        @endif
    </div>

    <div class="identity-container">
        <div class="badge">{{ $tipo }}</div>
        <h1 class="full-name">{{ mb_strtoupper($nombre) }}</h1>
    </div>

    <div class="bottom-area">
        <div class="qr-code">
            <img src="{{ $qrSrc }}" alt="QR">
        </div>
        <div class="metadata">
            <table class="metadata-table">
                <tr>
                    <td class="label-cell"><span class="label">STUDENT ID:</span></td>
                    <td><span class="value">{{ $idDisplay }}</span></td>
                </tr>
                <tr>
                    <td class="label-cell"><span class="label">DNI:</span></td>
                    <td><span class="value">{{ $dni ?? '---' }}</span></td>
                </tr>
                <tr>
                    <td class="label-cell"><span class="label">GRADO:</span></td>
                    <td><span class="value">{{ $grado ?? 'S/G' }}</span></td>
                </tr>
                <tr>
                    <td class="label-cell"><span class="label">NIVEL:</span></td>
                    <td><span class="value">{{ $nivel ?? 'S/N' }}</span></td>
                </tr>
                <tr>
                    <td class="label-cell"><span class="label">SECCIÓN:</span></td>
                    <td><span class="value">{{ $seccion ?? 'S/S' }}</span></td>
                </tr>
                <tr>
                    <td class="label-cell"><span class="label">TEL:</span></td>
                    <td><span class="value">{{ $telefono ?? '---' }}</span></td>
                </tr>
            </table>
        </div>
    </div>

    <div class="footer" style="background-color: {{ $config->primary_color }}">
        <span class="footer-text">{{ $config->footer_text ?? 'Periodo Académico '.date('Y') }}</span>
    </div>

</body>
</html>
