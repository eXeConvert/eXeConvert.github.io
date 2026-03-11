# Estadisticas IONOS para `execonvert`

Implementacion aislada por carpeta, compatible con el PHP antiguo disponible en IONOS.

## Estructura

- `track.php`: registra la visita y devuelve resumen para el footer via JSONP.
- `admin-stats.php`: panel privado con series por periodo y tops.
- `lib.php`: funciones comunes.
- `config.sample.php`: plantilla de configuracion.
- `data/`: almacenamiento local de esta app en el servidor.

## Despliegue previsto

Ruta objetivo en IONOS:

```text
/homepages/43/d785639964/htdocs/app/estadistica/execonvert/
```

URL publicas previstas:

- `https://bilateria.org/app/estadistica/execonvert/track.php`
- `https://bilateria.org/app/estadistica/execonvert/admin-stats.php`

## Almacenamiento

No usa base de datos ni IP ni cookies.

Guarda por visita:

- fecha y hora
- tipo de origen
- dominio referrer
- referrer completo
- `utm_source`
- `utm_medium`
- `utm_campaign`

## Periodos del panel

- hoy
- semana
- ultimos 7 dias
- mes
- ultimos 30 dias
- ano
- ultimos 365 dias
