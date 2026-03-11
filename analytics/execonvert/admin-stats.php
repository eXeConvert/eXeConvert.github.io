<?php
require_once dirname(__FILE__) . '/lib.php';
analytics_init_timezone();
analytics_require_login();

$allowed_ranges = array('today', 'last24', 'week', 'last7', 'month', 'last30', 'year', 'last365');
$range = isset($_GET['range']) ? $_GET['range'] : 'today';
if (!in_array($range, $allowed_ranges)) {
  $range = 'last30';
}

$cfg = analytics_get_period_config($range);
$rows = analytics_load_events_between($cfg['from'], $cfg['to']);
$series = analytics_build_series($rows, $range);
$summary = analytics_summary_counts();
$top_sources = analytics_count_values($rows, 'source_type');
$top_referrers = analytics_count_values($rows, 'referrer_domain');
$top_referrer_urls = analytics_count_values($rows, 'referrer');
$top_campaigns = analytics_count_campaigns($rows);
$max_value = 0;
foreach ($series as $value) {
  if ($value > $max_value) {
    $max_value = $value;
  }
}

function analytics_h($value) {
  return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
}

function analytics_render_top_table($title, $data) {
  $limit = 12;
  $count = 0;
  echo '<section class="card"><h2>' . analytics_h($title) . '</h2><table><thead><tr><th>Valor</th><th>Visitas</th></tr></thead><tbody>';
  foreach ($data as $label => $value) {
    echo '<tr><td>' . analytics_h($label) . '</td><td>' . intval($value) . '</td></tr>';
    $count++;
    if ($count >= $limit) {
      break;
    }
  }
  if ($count === 0) {
    echo '<tr><td colspan="2">Sin datos para este periodo.</td></tr>';
  }
  echo '</tbody></table></section>';
}

function analytics_trim_url($value) {
  $value = trim((string) $value);
  if (strlen($value) <= 72) return $value;
  return substr($value, 0, 69) . '...';
}

function analytics_render_top_links_table($title, $data) {
  $limit = 12;
  $count = 0;
  echo '<section class="card"><h2>' . analytics_h($title) . '</h2><table><thead><tr><th>URL</th><th>Visitas</th></tr></thead><tbody>';
  foreach ($data as $label => $value) {
    if ($label === '') continue;
    $safe_url = analytics_h($label);
    $safe_text = analytics_h(analytics_trim_url($label));
    echo '<tr><td><a href="' . $safe_url . '" target="_blank" rel="noopener noreferrer">' . $safe_text . '</a></td><td>' . intval($value) . '</td></tr>';
    $count++;
    if ($count >= $limit) {
      break;
    }
  }
  if ($count === 0) {
    echo '<tr><td colspan="2">Sin URLs completas disponibles para este periodo.</td></tr>';
  }
  echo '</tbody></table></section>';
}

$central_url = '../index.php';
?>
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title><?php echo analytics_h(analytics_config('site_name', 'Estadisticas')); ?></title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; background: #f4f7fb; color: #16313a; }
    .wrap { max-width: 1180px; margin: 0 auto; padding: 1.25rem; }
    h1 { margin: 0 0 .35rem; }
    .muted { color: #61727e; }
    .topbar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: .75rem; }
    .back-link { text-decoration: none; padding: .5rem .75rem; border-radius: 999px; background: #e7eef5; color: #17333a; }
    .nav { display: flex; flex-wrap: wrap; gap: .45rem; margin: 1rem 0 1.2rem; }
    .nav a { text-decoration: none; padding: .5rem .75rem; border-radius: 999px; background: #e7eef5; color: #17333a; }
    .nav a.active { background: #0f5c5c; color: #fff; }
    .grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem; }
    .card { background: #fff; border: 1px solid #dae3ec; border-radius: 14px; padding: 1rem; box-shadow: 0 12px 30px rgba(13,34,52,.05); }
    .metric { font-size: 2rem; font-weight: bold; margin-top: .25rem; color: #0f5c5c; }
    .chart { display: grid; grid-template-columns: repeat(auto-fit, minmax(24px, 1fr)); gap: .35rem; align-items: end; min-height: 230px; margin-top: 1rem; }
    .bar-wrap { display: flex; flex-direction: column; justify-content: end; align-items: center; min-height: 230px; }
    .bar { width: 100%; max-width: 28px; background: linear-gradient(180deg, #2fa39a 0%, #0f5c5c 100%); border-radius: 8px 8px 0 0; min-height: 2px; }
    .bar-label { margin-top: .45rem; font-size: .72rem; color: #61727e; writing-mode: vertical-rl; transform: rotate(180deg); white-space: nowrap; }
    table { width: 100%; border-collapse: collapse; }
    th, td { text-align: left; padding: .5rem 0; border-bottom: 1px solid #e8edf3; font-size: .92rem; vertical-align: top; }
    th:last-child, td:last-child { text-align: right; }
    .top-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; margin-top: 1rem; }
    .top-grid--three { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    @media (max-width: 960px) {
      .grid, .top-grid, .top-grid--three { grid-template-columns: 1fr; }
      .chart { overflow-x: auto; grid-auto-flow: column; grid-auto-columns: minmax(24px, 1fr); }
    }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="topbar">
      <div>
        <h1><?php echo analytics_h(analytics_config('site_name', 'Estadisticas')); ?></h1>
      </div>
      <a class="back-link" href="<?php echo analytics_h($central_url); ?>">Panel central</a>
    </div>

    <nav class="nav">
      <a href="?range=today"<?php if ($range === 'today') echo ' class="active"'; ?>>Hoy</a>
      <a href="?range=last24"<?php if ($range === 'last24') echo ' class="active"'; ?>>24 horas</a>
      <a href="?range=week"<?php if ($range === 'week') echo ' class="active"'; ?>>Semana</a>
      <a href="?range=last7"<?php if ($range === 'last7') echo ' class="active"'; ?>>7 dias</a>
      <a href="?range=month"<?php if ($range === 'month') echo ' class="active"'; ?>>Mes</a>
      <a href="?range=last30"<?php if ($range === 'last30') echo ' class="active"'; ?>>30 dias</a>
      <a href="?range=year"<?php if ($range === 'year') echo ' class="active"'; ?>>Ano</a>
      <a href="?range=last365"<?php if ($range === 'last365') echo ' class="active"'; ?>>365 dias</a>
    </nav>

    <section class="grid">
      <div class="card">
        <div class="muted">Visitas totales</div>
        <div class="metric"><?php echo intval($summary['total']); ?></div>
      </div>
      <div class="card">
        <div class="muted">Visitas hoy</div>
        <div class="metric"><?php echo intval($summary['today']); ?></div>
      </div>
      <div class="card">
        <div class="muted">Visitas en el periodo</div>
        <div class="metric"><?php echo count($rows); ?></div>
      </div>
    </section>

    <section class="card" style="margin-top:1rem;">
      <h2>Serie temporal</h2>
      <div class="chart">
        <?php foreach ($series as $label => $value) { $height = $max_value > 0 ? intval(round(($value / $max_value) * 190)) : 2; ?>
          <div class="bar-wrap" title="<?php echo analytics_h($label . ': ' . $value); ?>">
            <div class="bar" style="height:<?php echo $height; ?>px;"></div>
            <div class="bar-label"><?php echo analytics_h($label); ?></div>
          </div>
        <?php } ?>
      </div>
    </section>

    <div class="top-grid top-grid--three">
      <?php analytics_render_top_table('Top origenes', $top_sources); ?>
      <?php analytics_render_top_table('Top dominios de referencia', $top_referrers); ?>
      <?php analytics_render_top_table('Top campanas', $top_campaigns); ?>
    </div>
    <div class="top-grid">
      <?php analytics_render_top_links_table('Top URLs de referencia', $top_referrer_urls); ?>
    </div>
  </div>
</body>
</html>
