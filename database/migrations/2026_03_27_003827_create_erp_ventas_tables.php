<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Lookup tables first
        Schema::create('empresas', function (Blueprint $table) {
            $table->id('id_empresa');
            $table->string('nombre')->nullable();
            $table->timestamps();
        });

        Schema::create('tipo_pago', function (Blueprint $table) {
            $table->id('tipo_pago_id');
            $table->string('nombre')->nullable();
            $table->timestamps();
        });
        
        Schema::create('documentos_sunat', function (Blueprint $table) {
            $table->id('id_tido');
            $table->string('nombre')->nullable();
            $table->timestamps();
        });

        Schema::create('proveedores', function (Blueprint $table) {
            $table->id('proveedor_id');
            $table->string('nombre')->nullable();
            $table->timestamps();
        });

        Schema::create('metodo_pago', function (Blueprint $table) {
            $table->id('id_metodo_pago');
            $table->string('nombre')->nullable();
            $table->timestamps();
        });

        // caja_empresa
        Schema::create('caja_empresa', function (Blueprint $table) {
            $table->id('caja_id');
            $table->unsignedBigInteger('id_empresa')->nullable();
            $table->integer('sucursal')->nullable();
            $table->string('detalle', 200)->nullable();
            $table->date('fecha')->nullable();
            $table->string('entrada', 200)->nullable();
            $table->string('salida', 200)->nullable();
            $table->char('estado', 1)->default('1');
            $table->timestamps();
        });

        // caja_chica
        Schema::create('caja_chica', function (Blueprint $table) {
            $table->id('caja_chica_id');
            $table->unsignedBigInteger('id_caja_empresa')->nullable();
            $table->string('hora', 50)->nullable();
            $table->string('detalle', 220)->nullable();
            $table->char('tipo', 1)->default('f');
            $table->double('entrada', 15, 2)->nullable();
            $table->double('salida', 15, 2)->nullable();
            $table->char('metodo', 1)->nullable()->comment('1 = EFECTIVO 2 =TARJETAS 3 =TRANSFERENCIAS');
            $table->timestamps();
        });

        // clientes
        Schema::create('clientes', function (Blueprint $table) {
            $table->id('id_cliente');
            $table->string('documento', 11)->nullable();
            $table->string('datos', 245)->nullable();
            $table->string('direccion', 245)->nullable();
            $table->string('direccion2', 220)->nullable();
            $table->string('telefono', 200)->nullable();
            $table->string('telefono2', 200)->nullable();
            $table->string('email', 200)->nullable();
            $table->unsignedBigInteger('id_empresa')->nullable();
            $table->date('ultima_venta')->nullable();
            $table->double('total_venta', 8, 2)->nullable();
            $table->timestamps();
        });

        // productos
        Schema::create('productos', function (Blueprint $table) {
            $table->id('id_producto');
            $table->string('cod_barra', 100)->nullable();
            $table->string('descripcion', 245)->nullable();
            $table->double('precio', 10, 4)->nullable();
            $table->double('costo', 10, 4)->nullable();
            $table->integer('cantidad')->nullable();
            $table->integer('iscbp')->nullable();
            $table->unsignedBigInteger('id_empresa')->nullable();
            $table->integer('sucursal')->nullable();
            $table->date('ultima_salida')->nullable();
            $table->string('codsunat', 20)->nullable();
            $table->char('usar_barra', 1)->default('0');
            $table->double('precio_mayor', 10, 4)->nullable();
            $table->double('precio_menor', 10, 4)->nullable();
            $table->string('razon_social', 250)->nullable();
            $table->string('ruc', 11)->nullable();
            $table->char('estado', 1)->default('1');
            $table->char('almacen', 1)->nullable();
            $table->double('precio2', 10, 4)->default(0.0000);
            $table->double('precio3', 10, 4)->default(0.0000);
            $table->double('precio4', 10, 4)->default(0.0000);
            $table->double('precio_unidad', 10, 4)->nullable();
            $table->string('codigo', 20)->nullable();
            $table->double('costop', 10, 4)->nullable();
            $table->timestamps();
        });

        // compras
        Schema::create('compras', function (Blueprint $table) {
            $table->id('id_compra');
            $table->unsignedBigInteger('id_tido')->nullable();
            $table->unsignedBigInteger('id_tipo_pago')->nullable();
            $table->unsignedBigInteger('id_proveedor')->nullable();
            $table->string('fecha_emision', 50)->nullable();
            $table->string('fecha_vencimiento', 50)->nullable();
            $table->string('dias_pagos', 100)->nullable();
            $table->string('direccion', 100)->nullable();
            $table->string('serie', 50)->nullable();
            $table->string('numero', 50)->nullable();
            $table->string('total', 50)->nullable();
            $table->unsignedBigInteger('id_empresa')->nullable();
            $table->char('moneda', 1)->nullable();
            $table->integer('sucursal')->nullable();
            $table->timestamps();
        });

        // cotizaciones
        Schema::create('cotizaciones', function (Blueprint $table) {
            $table->id('cotizacion_id');
            $table->integer('numero')->nullable();
            $table->unsignedBigInteger('id_tido')->nullable();
            $table->unsignedBigInteger('id_tipo_pago')->nullable();
            $table->date('fecha')->nullable();
            $table->string('dias_pagos', 200)->nullable();
            $table->string('direccion', 220)->nullable();
            $table->unsignedBigInteger('id_cliente')->nullable();
            $table->double('total', 10, 2)->nullable();
            $table->char('estado', 1)->nullable();
            $table->unsignedBigInteger('id_empresa')->nullable();
            $table->integer('sucursal')->nullable();
            $table->integer('usar_precio')->nullable();
            $table->integer('moneda')->default(1);
            $table->string('cm_tc', 100)->nullable();
            $table->timestamps();
        });

        // ventas
        Schema::create('ventas', function (Blueprint $table) {
            $table->id('id_venta');
            $table->unsignedBigInteger('id_tido')->nullable();
            $table->unsignedBigInteger('id_tipo_pago')->nullable();
            $table->date('fecha_emision')->nullable();
            $table->date('fecha_vencimiento')->nullable();
            $table->string('dias_pagos', 200)->nullable();
            $table->string('direccion', 220)->nullable();
            $table->string('serie', 4)->nullable();
            $table->integer('numero')->nullable();
            $table->unsignedBigInteger('id_cliente')->nullable();
            $table->double('total', 10, 2)->nullable();
            $table->char('estado', 1)->nullable();
            $table->char('enviado_sunat', 1)->nullable();
            $table->unsignedBigInteger('id_empresa')->nullable();
            $table->integer('sucursal')->nullable();
            $table->char('apli_igv', 1)->default('1');
            $table->string('observacion', 220)->nullable();
            $table->double('igv', 10, 2)->default(0.18);
            $table->unsignedBigInteger('medoto_pago_id')->nullable();
            $table->string('pagado', 100)->nullable();
            $table->char('is_segun_pago', 1)->nullable();
            $table->unsignedBigInteger('medoto_pago2_id')->nullable();
            $table->string('pagado2', 100)->nullable();
            $table->integer('moneda')->default(1);
            $table->string('cm_tc', 100)->nullable();
            $table->integer('oc')->default(0);
            $table->string('num_oc', 100)->default('');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ventas');
        Schema::dropIfExists('cotizaciones');
        Schema::dropIfExists('compras');
        Schema::dropIfExists('productos');
        Schema::dropIfExists('clientes');
        Schema::dropIfExists('caja_chica');
        Schema::dropIfExists('caja_empresa');
        Schema::dropIfExists('metodo_pago');
        Schema::dropIfExists('proveedores');
        Schema::dropIfExists('documentos_sunat');
        Schema::dropIfExists('tipo_pago');
        Schema::dropIfExists('empresas');
    }
};
