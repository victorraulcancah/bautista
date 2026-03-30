<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Reporte de Pagos</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
            border: 1px solid #000;
            padding: 10px;
        }
        .header h3 {
            margin: 5px 0;
        }
        .info-section {
            margin-bottom: 15px;
        }
        .info-section p {
            margin: 3px 0;
            font-size: 11px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        table, th, td {
            border: 1px solid #000;
        }
        th {
            background-color: #f0f0f0;
            padding: 8px;
            text-align: center;
            font-size: 10px;
            font-weight: bold;
        }
        td {
            padding: 6px;
            text-align: center;
            font-size: 9px;
        }
        .text-right {
            text-align: right;
        }
        .total-row {
            background-color: #f9f9f9;
            font-weight: bold;
        }
        .total-section {
            margin-top: 10px;
            border: 1px solid #000;
            padding: 10px;
        }
        .total-section table {
            border: none;
        }
        .total-section td {
            border: none;
            font-size: 11px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h3>RESUMEN DE PAGOS</h3>
        @if($subtitulo)
            <p style="font-size: 11px; margin: 5px 0;">{{ $subtitulo }}</p>
        @endif
    </div>

    @if($contacto && $estudiante)
    <div class="info-section">
        <p><strong>Padre/Apoderado:</strong> {{ $contacto->nombres }} {{ $contacto->apellidos }}</p>
        <p><strong>DNI:</strong> {{ $contacto->numero_doc ?? '—' }}</p>
        <p><strong>Estudiante:</strong> {{ $estudiante->estu_nombres }} {{ $estudiante->estu_apellidos }}</p>
        @if($estudiante->pivot && $estudiante->pivot->mensualidad)
            <p><strong>Mensualidad:</strong> S/ {{ number_format($estudiante->pivot->mensualidad, 2) }}</p>
        @endif
    </div>
    @endif

    <table>
        <thead>
            <tr>
                <th>AÑO</th>
                <th>MES</th>
                <th>MENSUALIDAD</th>
                <th>UNIFORME</th>
                <th>OTRO</th>
                <th>TOTAL</th>
            </tr>
        </thead>
        <tbody>
            @forelse($pagos as $pago)
            <tr>
                <td>{{ $pago->pag_anual }}</td>
                <td>{{ $pago->pag_mes }}</td>
                <td class="text-right">S/ {{ number_format($pago->pag_monto, 2) }}</td>
                <td class="text-right">S/ {{ number_format($pago->pag_otro1, 2) }}</td>
                <td class="text-right">S/ {{ number_format($pago->pag_otro2, 2) }}</td>
                <td class="text-right">S/ {{ number_format($pago->total, 2) }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="6">No hay pagos registrados</td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <div class="total-section">
        <table>
            <tr>
                <td style="width: 70%;"></td>
                <td style="width: 15%; text-align: center;"><strong>TOTAL (S/)</strong></td>
                <td style="width: 15%; text-align: center;"><strong>S/ {{ number_format($total, 2) }}</strong></td>
            </tr>
        </table>
    </div>

    <div style="margin-top: 30px; font-size: 10px; text-align: center; color: #666;">
        <p>Generado el {{ date('d/m/Y H:i:s') }}</p>
    </div>
</body>
</html>
