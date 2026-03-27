# -*- coding: utf-8 -*-
from config import log, NOW


def _migrate_generic(old, new, dry_run, table_old: str, table_new: str,
                     pk: str, columns: list, label: str):
    """Generic copy-all helper for simple ERP tables with no FK remapping."""
    log.head(f"ERP  {table_old} → {table_new}")

    with old.cursor() as c:
        c.execute(f"SELECT * FROM {table_old} ORDER BY {pk}")
        rows = c.fetchall()
    log.info(f"{len(rows)} registros encontrados")

    with new.cursor() as c:
        c.execute(f"SELECT {pk} FROM {table_new}")
        existing = {r[pk] for r in c.fetchall()}

    inserted = skipped = 0
    cols_sql = ", ".join(columns + ["created_at", "updated_at"])
    placeholders = ", ".join([f"%({c})s" for c in columns] + ["%(ts)s", "%(ts)s"])

    with new.cursor() as c:
        for r in rows:
            if r[pk] in existing:
                skipped += 1
                continue
            params = {col: r.get(col) for col in columns}
            params["ts"] = NOW
            if not dry_run:
                c.execute(
                    f"INSERT INTO {table_new} ({cols_sql}) VALUES ({placeholders})",
                    params,
                )
            log.ok(f"  {pk}={r[pk]}  {label}={str(r.get(label, ''))[:60]}")
            inserted += 1

    if not dry_run:
        new.commit()

    log.info(f"Insertados: {inserted}  |  Omitidos: {skipped}")


def migrate_erp(old, new, dry_run: bool):
    # 1. empresas
    _migrate_generic(old, new, dry_run, "empresas", "empresas",
                     "id_empresa",
                     ["id_empresa", "nombre"],
                     "nombre")

    # 2. tipo_pago
    _migrate_generic(old, new, dry_run, "tipo_pago", "tipo_pago",
                     "tipo_pago_id",
                     ["tipo_pago_id", "nombre"],
                     "nombre")

    # 3. documentos_sunat
    _migrate_generic(old, new, dry_run, "documentos_sunat", "documentos_sunat",
                     "id_tido",
                     ["id_tido", "nombre"],
                     "nombre")

    # 4. metodo_pago
    _migrate_generic(old, new, dry_run, "metodo_pago", "metodo_pago",
                     "id_metodo_pago",
                     ["id_metodo_pago", "nombre"],
                     "nombre")

    # 5. proveedores
    _migrate_generic(old, new, dry_run, "proveedores", "proveedores",
                     "proveedor_id",
                     ["proveedor_id", "nombre"],
                     "nombre")

    # 6. clientes
    _migrate_generic(old, new, dry_run, "clientes", "clientes",
                     "id_cliente",
                     ["id_cliente", "documento", "datos", "direccion", "direccion2",
                      "telefono", "telefono2", "email", "id_empresa",
                      "ultima_venta", "total_venta"],
                     "datos")

    # 7. productos
    _migrate_generic(old, new, dry_run, "productos", "productos",
                     "id_producto",
                     ["id_producto", "cod_barra", "descripcion", "precio", "costo",
                      "cantidad", "iscbp", "id_empresa", "sucursal",
                      "ultima_salida", "codsunat", "usar_barra",
                      "precio_mayor", "precio_menor", "razon_social", "ruc",
                      "estado", "almacen", "precio2", "precio3", "precio4",
                      "precio_unidad", "codigo", "costop"],
                     "descripcion")

    # 8. caja_empresa
    _migrate_generic(old, new, dry_run, "caja_empresa", "caja_empresa",
                     "caja_id",
                     ["caja_id", "id_empresa", "sucursal", "detalle", "fecha",
                      "entrada", "salida", "estado"],
                     "detalle")

    # 9. caja_chica
    _migrate_generic(old, new, dry_run, "caja_chica", "caja_chica",
                     "caja_chica_id",
                     ["caja_chica_id", "id_caja_empresa", "hora", "detalle",
                      "tipo", "entrada", "salida", "metodo"],
                     "detalle")

    # 10. compras
    _migrate_generic(old, new, dry_run, "compras", "compras",
                     "id_compra",
                     ["id_compra", "id_tido", "id_tipo_pago", "id_proveedor",
                      "fecha_emision", "fecha_vencimiento", "dias_pagos",
                      "direccion", "serie", "numero", "total",
                      "id_empresa", "moneda", "sucursal"],
                     "total")

    # 11. cotizaciones
    _migrate_generic(old, new, dry_run, "cotizaciones", "cotizaciones",
                     "cotizacion_id",
                     ["cotizacion_id", "numero", "id_tido", "id_tipo_pago", "fecha",
                      "dias_pagos", "direccion", "id_cliente", "total",
                      "estado", "id_empresa", "sucursal", "usar_precio",
                      "moneda", "cm_tc"],
                     "total")

    # 12. ventas
    log.head("ERP  ventas → ventas")
    with old.cursor() as c:
        c.execute("SELECT * FROM ventas ORDER BY id_venta")
        rows = c.fetchall()
    log.info(f"{len(rows)} ventas encontradas")

    with new.cursor() as c:
        c.execute("SELECT id_venta FROM ventas")
        existing = {r["id_venta"] for r in c.fetchall()}

    inserted = skipped = 0
    with new.cursor() as c:
        for r in rows:
            if r["id_venta"] in existing:
                skipped += 1
                continue
            params = {k: r.get(k) for k in [
                "id_venta", "id_tido", "id_tipo_pago", "fecha_emision",
                "fecha_vencimiento", "dias_pagos", "direccion", "serie",
                "numero", "id_cliente", "total", "estado", "enviado_sunat",
                "id_empresa", "sucursal", "apli_igv", "observacion", "igv",
                "medoto_pago_id", "pagado", "is_segun_pago", "medoto_pago2_id",
                "pagado2", "moneda", "cm_tc", "oc", "num_oc"
            ]}
            params["ts"] = NOW
            if not dry_run:
                c.execute("""
                    INSERT INTO ventas
                        (id_venta, id_tido, id_tipo_pago, fecha_emision, fecha_vencimiento,
                         dias_pagos, direccion, serie, numero, id_cliente, total, estado,
                         enviado_sunat, id_empresa, sucursal, apli_igv, observacion, igv,
                         medoto_pago_id, pagado, is_segun_pago, medoto_pago2_id, pagado2,
                         moneda, cm_tc, oc, num_oc, created_at, updated_at)
                    VALUES
                        (%(id_venta)s, %(id_tido)s, %(id_tipo_pago)s, %(fecha_emision)s,
                         %(fecha_vencimiento)s, %(dias_pagos)s, %(direccion)s, %(serie)s,
                         %(numero)s, %(id_cliente)s, %(total)s, %(estado)s, %(enviado_sunat)s,
                         %(id_empresa)s, %(sucursal)s, %(apli_igv)s, %(observacion)s, %(igv)s,
                         %(medoto_pago_id)s, %(pagado)s, %(is_segun_pago)s, %(medoto_pago2_id)s,
                         %(pagado2)s, %(moneda)s, %(cm_tc)s, %(oc)s, %(num_oc)s, %(ts)s, %(ts)s)
                """, params)
            log.ok(f"  id_venta={r['id_venta']}  total={r.get('total')}  estado={r.get('estado')}")
            inserted += 1

    if not dry_run:
        new.commit()
    log.info(f"Insertados: {inserted}  |  Omitidos: {skipped}")
