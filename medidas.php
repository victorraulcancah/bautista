<?php
require_once "funcionalidades/config/Conexion.php";
require 'vendor/autoload.php';

use Endroid\QrCode\QrCode;
use Endroid\QrCode\Writer\PngWriter;

if (!isset($_POST['nivel_id']) || !isset($_POST['periodo'])) {
    http_response_code(400);
    echo json_encode(['res' => false, 'mensaje' => 'Nivel y periodo requeridos']);
    exit;
}

$nivel_id = $_POST['nivel_id'];
$periodo = $_POST['periodo'];

try {
    $conexion = (new Conexion())->getConexion();

    // Obtener todos los estudiantes del nivel
    $sql = "SELECT 
                e.estu_id,
                p.primer_nombre, 
                p.segundo_nombre,
                p.apellido_paterno,
                p.apellido_materno,
                e.foto,
                p.doc_numero as dni,
                p.telefono_pricipal as telefono,
                n.nombre_nivel as nivel_nombre,
                g.nombre_grado as grado_nombre,
                s.nombre as seccion_nombre,
                ie.insti_razon_social as institucion_nombre,
                YEAR(CURDATE()) as periodo_actual
            FROM estudiantes e 
            LEFT JOIN perfiles p ON e.perfil_id = p.perfil_id
            INNER JOIN matriculas m ON m.id_estudiante = e.estu_id
            INNER JOIN matricula_aperturas ma ON m.id_apertura_mtr = ma.matr_id
            LEFT JOIN niveles_educativos n ON n.nivel_id = m.nivel_educativo
            LEFT JOIN grados g ON m.grado = g.grado_id
            LEFT JOIN secciones s ON m.seccion = s.seccion_id
            LEFT JOIN institucion_educativa ie ON ie.insti_id = ma.id_inst
            WHERE m.nivel_educativo = ? 
            AND ma.anio = ?
            AND e.estado = '1'
            ORDER BY g.nombre_grado, s.nombre, p.apellido_paterno, p.apellido_materno";

    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("is", $nivel_id, $periodo);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows == 0) {
        echo json_encode(['res' => false, 'mensaje' => 'No se encontraron estudiantes para este nivel']);
        exit;
    }

    $estudiantes = $result->fetch_all(MYSQLI_ASSOC);
    $total_estudiantes = count($estudiantes);

    // Crear el PDF en formato A4 para múltiples fotochecks
    $pdf = new TCPDF('P', 'mm', 'A4', true, 'UTF-8', false);
    $pdf->setPrintHeader(false);
    $pdf->setPrintFooter(false);
    $pdf->SetMargins(5, 5, 5);
    $pdf->SetAutoPageBreak(false, 0);

    // Crear carpeta temporal si no existe
    $tempDir = 'images/temp/';
    if (!file_exists($tempDir)) {
        mkdir($tempDir, 0755, true);
    }

    // Configuración del layout: 3 columnas x 3 filas = 9 fotochecks por página
    // Dimensiones: 5.4cm x 8.6cm (orientación vertical)
    $fotocheck_width = 54;
    $fotocheck_height = 85.6;
    $cols = 3;
    $rows = 3;
    $margin_x = 10; // Margen izquierdo
    $margin_y = 10; // Margen superior
    $spacing_x = 6; // Espacio entre columnas
    $spacing_y = 6; // Espacio entre filas

    $fotochecks_per_page = $cols * $rows;
    $current_position = 0;

    // Generar un fotocheck por cada estudiante
    foreach ($estudiantes as $index => $e) {
        // Calcular posición en la página
        $position_in_page = $current_position % $fotochecks_per_page;

        // Si es el primer fotocheck de la página, crear nueva página
        if ($position_in_page == 0) {
            $pdf->AddPage();
        }

        // Calcular fila y columna
        $row = floor($position_in_page / $cols);
        $col = $position_in_page % $cols;

        // Calcular posición X e Y
        $x = $margin_x + ($col * ($fotocheck_width + $spacing_x));
        $y = $margin_y + ($row * ($fotocheck_height + $spacing_y));

        // DISEÑO MEJORADO - FONDO AZUL PROFESIONAL
        // DISEÑO VERTICAL - 54mm ancho x 85.6mm alto
        // Dibujar el fondo blanco para el header primero
        $pdf->SetFillColor(255, 255, 255);
        $pdf->Rect($x, $y, $fotocheck_width, 18, 'F');

        // Dibujar el fondo gris para el cuerpo
        $pdf->SetFillColor(130, 143, 133);
        $pdf->Rect($x, $y + 18, $fotocheck_width, $fotocheck_height - 18, 'F');

        // Elementos decorativos (eliminados por solicitud del usuario)
        // $pdf->SetFillColor(255, 255, 255, 0.05);
        // $pdf->Circle($x + 45, $y + 10, 5, 0, 360, 'F');
        // $pdf->Circle($x + 8, $y + 80, 4, 0, 360, 'F');
        // $pdf->Circle($x + 47, $y + 78, 3, 0, 360, 'F');

        // Logo centrado (sobre fondo blanco)
        $logoPath = 'images/esama-bg.png';
        if (file_exists($logoPath)) {
            $logo_width = 16;
            $logo_height = 8;
            $logo_x = $x + (($fotocheck_width - $logo_width) / 2);
            $pdf->Image($logoPath, $logo_x, $y + 2, $logo_width, $logo_height, '', '', '', true, 300);
        } else {
            $pdf->SetFillColor(26, 69, 128);
            $pdf->Circle($x + ($fotocheck_width / 2), $y + 6, 4, 0, 360, 'F');
            $pdf->SetTextColor(255, 255, 255);
            $pdf->SetFont('helvetica', 'B', 6);
            $institucion_inicial = isset($e['institucion_nombre']) ? substr($e['institucion_nombre'], 0, 1) : 'E';
            $pdf->SetXY($x + ($fotocheck_width / 2) - 2, $y + 4.5);
            $pdf->Cell(4, 3, $institucion_inicial, 0, 0, 'C');
        }

        // Nombre de la institución (Texto sobre blanco)
        $pdf->SetTextColor(30, 30, 30);
        $pdf->SetFont('helvetica', 'B', 5);
        $pdf->SetXY($x, $y + 11);
        $pdf->Cell($fotocheck_width, 1.5, 'IEP BAUTISTA LA PASCANA', 0, 0, 'C');

        $pdf->SetFont('helvetica', '', 3.5);
        $pdf->SetXY($x, $y + 14);
        $pdf->Cell($fotocheck_width, 1.5, 'FOTOCHECK', 0, 0, 'C');

        // Marco para la foto centrado
        $foto_size = 32;
        $foto_x = $x + (($fotocheck_width - $foto_size) / 2);
        $pdf->SetFillColor(255, 255, 255);
        $pdf->SetDrawColor(200, 200, 200);
        $pdf->SetLineWidth(0.25);
        $pdf->Rect($foto_x, $y + 22, $foto_size, $foto_size, 'FD');

        // Foto del estudiante
        $fotoPath = 'images/fotos_alumnos/' . $e['foto'];
        $fotoDefault = 'images/default-avatar.png';
        $foto = (file_exists($fotoPath) ? $fotoPath : $fotoDefault);
        $pdf->Image($foto, $foto_x + 0.6, $y + 22.6, $foto_size - 1.2, $foto_size - 1.2, '', '', '', true, 300);

        // Área de información (más oscura con borde)
        $pdf->SetFillColor(100, 113, 103);
        $pdf->Rect($x + 2, $y + 56, $fotocheck_width - 4, 27, 'F');

        $pdf->SetDrawColor(30, 30, 30, 0.6);
        $pdf->SetLineWidth(0.2);
        $pdf->Rect($x + 2, $y + 56, $fotocheck_width - 4, 27, 'D');

        // Nombre y apellidos
        $pdf->SetTextColor(255, 255, 255);
        $pdf->SetFont('helvetica', 'B', 6);
        $pdf->SetXY($x + 2, $y + 57.5);
        $pdf->Cell($fotocheck_width - 4, 2.8, strtoupper(trim($e['primer_nombre'] . ' ' . $e['segundo_nombre'])), 0, 0, 'C');
        $pdf->SetXY($x + 2, $y + 60.5);
        $pdf->Cell($fotocheck_width - 4, 2.8, strtoupper(trim($e['apellido_paterno'] . ' ' . $e['apellido_materno'])), 0, 0, 'C');

        // Etiqueta ALUMNO(A)
        $pdf->SetFillColor(37, 99, 235);
        $etiqueta_width = 24;
        $etiqueta_x = $x + (($fotocheck_width - $etiqueta_width) / 2);
        $pdf->Rect($etiqueta_x, $y + 64.5, $etiqueta_width, 2.8, 'F');
        $pdf->SetTextColor(255, 255, 255);
        $pdf->SetFont('helvetica', 'B', 3.8);
        $pdf->SetXY($etiqueta_x, $y + 65.2);
        $pdf->Cell($etiqueta_width, 1.5, 'ALUMNO(A)', 0, 0, 'C');

        // Generar QR
        $qrTmp = $tempDir . 'qr_' . $e['estu_id'] . '.png';
        $qr = QrCode::create($e['estu_id'] . ',1')->setSize(120);
        $writer = new PngWriter();
        $qrResult = $writer->write($qr);
        $qrResult->saveToFile($qrTmp);

        // QR
        $pdf->Image($qrTmp, $x + 4.5, $y + 69, 10, 10);

        // Detalles de información
        $pdf->SetTextColor(255, 255, 255);
        $y_info = $y + 68.5;
        $label_x = $x + 16.5;
        $value_x = $x + 32.5;
        $font_size = 3.6;
        $line_height = 2.15;

        // Student ID
        $pdf->SetFont('helvetica', 'B', $font_size);
        $pdf->SetXY($label_x, $y_info);
        $pdf->Cell(15, 1.5, 'STUDENT ID:', 0, 0, 'L');
        $pdf->SetFont('helvetica', '', $font_size);
        $pdf->SetXY($value_x, $y_info);
        $pdf->Cell(30, 1.5, 'EST-' . str_pad($e['estu_id'], 6, '0', STR_PAD_LEFT), 0, 0, 'L');

        // DNI
        $pdf->SetFont('helvetica', 'B', $font_size);
        $pdf->SetXY($label_x, $y_info + $line_height);
        $pdf->Cell(15, 1.5, 'DNI:', 0, 0, 'L');
        $pdf->SetFont('helvetica', '', $font_size);
        $pdf->SetXY($value_x, $y_info + $line_height);
        $pdf->Cell(30, 1.5, $e['dni'] ?: 'N/A', 0, 0, 'L');

        // Grado
        $pdf->SetFont('helvetica', 'B', $font_size);
        $pdf->SetXY($label_x, $y_info + ($line_height * 2));
        $pdf->Cell(15, 1.5, 'GRADO:', 0, 0, 'L');
        $pdf->SetFont('helvetica', '', $font_size);
        $pdf->SetXY($value_x, $y_info + ($line_height * 2));
        $pdf->Cell(30, 1.5, ($e['grado_nombre'] ?: 'N/A'), 0, 0, 'L');

        // Nivel
        $pdf->SetFont('helvetica', 'B', $font_size);
        $pdf->SetXY($label_x, $y_info + ($line_height * 3));
        $pdf->Cell(15, 1.5, 'NIVEL:', 0, 0, 'L');
        $pdf->SetFont('helvetica', '', $font_size);
        $pdf->SetXY($value_x, $y_info + ($line_height * 3));
        $pdf->Cell(30, 1.5, ($e['nivel_nombre'] ?: 'N/A'), 0, 0, 'L');

        // Seccion
        $pdf->SetFont('helvetica', 'B', $font_size);
        $pdf->SetXY($label_x, $y_info + ($line_height * 4));
        $pdf->Cell(15, 1.5, 'SECCION:', 0, 0, 'L');
        $pdf->SetFont('helvetica', '', $font_size);
        $pdf->SetXY($value_x, $y_info + ($line_height * 4));
        $pdf->Cell(30, 1.5, ($e['seccion_nombre'] ?: 'UNICA'), 0, 0, 'L');

        // Tel
        $pdf->SetFont('helvetica', 'B', $font_size);
        $pdf->SetXY($label_x, $y_info + ($line_height * 5));
        $pdf->Cell(15, 1.5, 'TEL:', 0, 0, 'L');
        $pdf->SetFont('helvetica', '', $font_size);
        $pdf->SetXY($value_x, $y_info + ($line_height * 5));
        $pdf->Cell(30, 1.5, ($e['telefono'] ?: 'N/A'), 0, 0, 'L');

        // Año académico
        $pdf->SetFillColor(37, 99, 237);
        $pdf->Rect($x, $y + 82, $fotocheck_width, 3.6, 'F');
        $pdf->SetTextColor(255, 255, 255);
        $pdf->SetFont('helvetica', 'B', 4);
        $pdf->SetXY($x, $y + 83);
        $pdf->Cell($fotocheck_width, 1.8, 'Periodo Academico ' . ($e['periodo_actual'] ?: date('Y')), 0, 0, 'C');

        // Borde exterior negro grueso
        $pdf->SetDrawColor(0, 0, 0);
        $pdf->SetLineWidth(0.6);
        $pdf->Rect($x, $y, $fotocheck_width, $fotocheck_height, 'D');

        // Limpiar QR temporal
        if (file_exists($qrTmp))
            unlink($qrTmp);

        $current_position++;
    }

    // Guardar PDF
    $filename = 'fotochecks_nivel_' . $nivel_id . '_' . $periodo . '_' . date('Y_m_d_His') . '.pdf';
    $pdf_dir = __DIR__ . '/../../public/PDF/fotochecks/';
    if (!file_exists($pdf_dir))
        mkdir($pdf_dir, 0755, true);
    $pdf_path = $pdf_dir . $filename;

    $pdf->Output($pdf_path, 'F');

    $pdf_url = 'public/PDF/fotochecks/' . $filename;

    echo json_encode([
        'res' => true,
        'mensaje' => 'Fotochecks generados exitosamente',
        'pdf_url' => $pdf_url,
        'total_estudiantes' => $total_estudiantes
    ]);
} catch (Exception $e) {
    echo json_encode(['res' => false, 'mensaje' => 'Error interno: ' . $e->getMessage()]);
}
