<?php
require_once dirname(__FILE__) . '/config.php';

function analytics_init_timezone() {
  global $ANALYTICS_CONFIG;
  $tz = isset($ANALYTICS_CONFIG['timezone']) ? $ANALYTICS_CONFIG['timezone'] : 'UTC';
  if (function_exists('date_default_timezone_set')) {
    @date_default_timezone_set($tz);
  }
  @putenv('TZ=' . $tz);
}

function analytics_config($key, $default) {
  global $ANALYTICS_CONFIG;
  return isset($ANALYTICS_CONFIG[$key]) ? $ANALYTICS_CONFIG[$key] : $default;
}

function analytics_ensure_dir($path) {
  if (is_dir($path)) {
    return true;
  }
  return @mkdir($path, 0775);
}

function analytics_bootstrap_storage() {
  $data_dir = analytics_config('data_dir', dirname(__FILE__) . '/data');
  $events_dir = $data_dir . '/events';
  analytics_ensure_dir($data_dir);
  analytics_ensure_dir($events_dir);
  return array($data_dir, $events_dir);
}

function analytics_safe_value($value) {
  $value = trim((string) $value);
  $value = str_replace("\r", ' ', $value);
  $value = str_replace("\n", ' ', $value);
  $value = str_replace("\t", ' ', $value);
  return $value;
}

function analytics_parse_url_host($url) {
  $url = trim((string) $url);
  if ($url === '') {
    return '';
  }
  $parts = @parse_url($url);
  if (!is_array($parts) || !isset($parts['host'])) {
    return '';
  }
  return strtolower((string) $parts['host']);
}

function analytics_classify_source($referrer, $utm_source, $utm_medium, $utm_campaign) {
  $utm_source = strtolower(trim((string) $utm_source));
  $utm_medium = strtolower(trim((string) $utm_medium));
  $utm_campaign = strtolower(trim((string) $utm_campaign));
  $domain = analytics_parse_url_host($referrer);

  if ($utm_source !== '' || $utm_medium !== '' || $utm_campaign !== '') {
    return 'campaign';
  }
  if ($domain === '') {
    return 'direct';
  }
  if (preg_match('/(google|bing|duckduckgo|yahoo|baidu|yandex)\./', $domain)) {
    return 'search';
  }
  if (preg_match('/(^|\.)(facebook|m\.facebook|instagram|l\.instagram|t\.co|x\.com|twitter|linkedin|lnkd|reddit|youtube|youtu\.be|telegram|t\.me|whatsapp|discord|mastodon)\./', $domain)) {
    return 'social';
  }
  return 'referral';
}

function analytics_is_bot() {
  $ua = isset($_SERVER['HTTP_USER_AGENT']) ? strtolower($_SERVER['HTTP_USER_AGENT']) : '';
  if ($ua === '') {
    return false;
  }
  return preg_match('/bot|crawl|spider|slurp|curl|wget|python|monitor|uptime|validator|preview|headless/', $ua) ? true : false;
}

function analytics_read_counter_map($path) {
  $map = array();
  if (!file_exists($path)) {
    return $map;
  }
  $fp = @fopen($path, 'rb');
  if (!$fp) {
    return $map;
  }
  while (!feof($fp)) {
    $line = fgets($fp, 4096);
    if ($line === false) {
      break;
    }
    $line = trim($line);
    if ($line === '') {
      continue;
    }
    $parts = explode("\t", $line);
    if (count($parts) < 2) {
      continue;
    }
    $map[$parts[0]] = intval($parts[1]);
  }
  fclose($fp);
  return $map;
}

function analytics_write_counter_map($path, $map) {
  $fp = @fopen($path, 'a+');
  if (!$fp) {
    return false;
  }
  if (!@flock($fp, LOCK_EX)) {
    fclose($fp);
    return false;
  }
  $current = '';
  foreach ($map as $key => $value) {
    $current .= $key . "\t" . intval($value) . "\n";
  }
  rewind($fp);
  @ftruncate($fp, 0);
  fwrite($fp, $current);
  fflush($fp);
  @flock($fp, LOCK_UN);
  fclose($fp);
  return true;
}

function analytics_increment_counters($date_key) {
  list($data_dir, $events_dir) = analytics_bootstrap_storage();
  $counter_path = $data_dir . '/counters.tsv';
  $map = analytics_read_counter_map($counter_path);
  if (!isset($map['total'])) {
    $map['total'] = 0;
  }
  if (!isset($map[$date_key])) {
    $map[$date_key] = 0;
  }
  $map['total'] = intval($map['total']) + 1;
  $map[$date_key] = intval($map[$date_key]) + 1;
  analytics_write_counter_map($counter_path, $map);
  return $map;
}

function analytics_append_event($row) {
  list($data_dir, $events_dir) = analytics_bootstrap_storage();
  $month_key = date('Y-m');
  $path = $events_dir . '/' . $month_key . '.tsv';
  $fp = @fopen($path, 'ab');
  if (!$fp) {
    return false;
  }
  if (!@flock($fp, LOCK_EX)) {
    fclose($fp);
    return false;
  }
  fwrite($fp, implode("\t", $row) . "\n");
  fflush($fp);
  @flock($fp, LOCK_UN);
  fclose($fp);
  return true;
}

function analytics_js_escape($value) {
  $value = (string) $value;
  $value = str_replace('\\', '\\\\', $value);
  $value = str_replace("'", "\\'", $value);
  $value = str_replace("\r", '\r', $value);
  $value = str_replace("\n", '\n', $value);
  return $value;
}

function analytics_to_js_literal($value) {
  if (is_bool($value)) {
    return $value ? 'true' : 'false';
  }
  if (is_int($value) || is_float($value)) {
    return (string) $value;
  }
  if (is_array($value)) {
    $is_list = true;
    $index = 0;
    foreach ($value as $key => $item) {
      if ((string) $key !== (string) $index) {
        $is_list = false;
        break;
      }
      $index++;
    }
    $parts = array();
    foreach ($value as $key => $item) {
      if ($is_list) {
        $parts[] = analytics_to_js_literal($item);
      } else {
        $parts[] = "'" . analytics_js_escape($key) . "':" . analytics_to_js_literal($item);
      }
    }
    if ($is_list) {
      return '[' . implode(',', $parts) . ']';
    }
    return '{' . implode(',', $parts) . '}';
  }
  if ($value === null) {
    return 'null';
  }
  return "'" . analytics_js_escape($value) . "'";
}

function analytics_output_jsonp($payload, $callback) {
  $callback = trim((string) $callback);
  if ($callback === '' || !preg_match('/^[A-Za-z0-9_\.]+$/', $callback)) {
    $callback = '__analyticsNoop';
  }
  header('Content-Type: application/javascript; charset=UTF-8');
  echo $callback . '(' . analytics_to_js_literal($payload) . ');';
}

function analytics_load_events_between($from_ts, $to_ts) {
  list($data_dir, $events_dir) = analytics_bootstrap_storage();
  $rows = array();
  $cursor = mktime(0, 0, 0, intval(date('n', $from_ts)), 1, intval(date('Y', $from_ts)));
  $end_month = mktime(0, 0, 0, intval(date('n', $to_ts)), 1, intval(date('Y', $to_ts)));
  while ($cursor <= $end_month) {
    $path = $events_dir . '/' . date('Y-m', $cursor) . '.tsv';
    if (file_exists($path)) {
      $fp = @fopen($path, 'rb');
      if ($fp) {
        while (!feof($fp)) {
          $line = fgets($fp, 8192);
          if ($line === false) {
            break;
          }
          $line = rtrim($line, "\r\n");
          if ($line === '') {
            continue;
          }
          $parts = explode("\t", $line);
          if (count($parts) < 9) {
            continue;
          }
          $ts = intval($parts[0]);
          if ($ts < $from_ts || $ts > $to_ts) {
            continue;
          }
          $rows[] = array(
            'ts' => $ts,
            'date' => $parts[1],
            'hour' => $parts[2],
            'source_type' => $parts[3],
            'referrer_domain' => $parts[4],
            'referrer' => $parts[5],
            'utm_source' => $parts[6],
            'utm_medium' => $parts[7],
            'utm_campaign' => $parts[8]
          );
        }
        fclose($fp);
      }
    }
    $cursor = mktime(0, 0, 0, intval(date('n', $cursor)) + 1, 1, intval(date('Y', $cursor)));
  }
  return $rows;
}

function analytics_get_period_config($range) {
  $today = getdate(time());
  $year = intval($today['year']);
  $month = intval($today['mon']);
  $day = intval($today['mday']);
  $midnight = mktime(0, 0, 0, $month, $day, $year);

  switch ($range) {
    case 'today':
      return array(
        'label' => 'Hoy',
        'from' => $midnight,
        'to' => $midnight + 86399,
        'granularity' => 'hour'
      );
    case 'last24':
      return array(
        'label' => 'Ultimas 24 horas',
        'from' => time() - 86399,
        'to' => time(),
        'granularity' => 'hour'
      );
    case 'week':
      $weekday = intval(date('N'));
      $start = $midnight - (($weekday - 1) * 86400);
      return array(
        'label' => 'Esta semana',
        'from' => $start,
        'to' => $midnight + 86399,
        'granularity' => 'day'
      );
    case 'last7':
      return array(
        'label' => 'Ultimos 7 dias',
        'from' => $midnight - (6 * 86400),
        'to' => $midnight + 86399,
        'granularity' => 'day'
      );
    case 'month':
      $start = mktime(0, 0, 0, $month, 1, $year);
      return array(
        'label' => 'Este mes',
        'from' => $start,
        'to' => $midnight + 86399,
        'granularity' => 'day'
      );
    case 'last30':
      return array(
        'label' => 'Ultimos 30 dias',
        'from' => $midnight - (29 * 86400),
        'to' => $midnight + 86399,
        'granularity' => 'day'
      );
    case 'year':
      $start = mktime(0, 0, 0, 1, 1, $year);
      return array(
        'label' => 'Este ano',
        'from' => $start,
        'to' => $midnight + 86399,
        'granularity' => 'month'
      );
    case 'last365':
      return array(
        'label' => 'Ultimos 365 dias',
        'from' => $midnight - (364 * 86400),
        'to' => $midnight + 86399,
        'granularity' => 'month'
      );
    default:
      return analytics_get_period_config('last30');
  }
}

function analytics_build_series($rows, $range) {
  $cfg = analytics_get_period_config($range);
  $series = array();
  $cursor = $cfg['from'];

  if ($cfg['granularity'] === 'hour') {
    for ($hour = 0; $hour < 24; $hour++) {
      $key = sprintf('%02d', $hour);
      $series[$key] = 0;
    }
    foreach ($rows as $row) {
      $key = sprintf('%02d', intval($row['hour']));
      if (!isset($series[$key])) {
        $series[$key] = 0;
      }
      $series[$key]++;
    }
  } elseif ($cfg['granularity'] === 'month') {
    while ($cursor <= $cfg['to']) {
      $key = date('Y-m', $cursor);
      $series[$key] = 0;
      $cursor = mktime(0, 0, 0, intval(date('n', $cursor)) + 1, 1, intval(date('Y', $cursor)));
    }
    foreach ($rows as $row) {
      $key = date('Y-m', intval($row['ts']));
      if (!isset($series[$key])) {
        $series[$key] = 0;
      }
      $series[$key]++;
    }
  } else {
    while ($cursor <= $cfg['to']) {
      $key = date('Y-m-d', $cursor);
      $series[$key] = 0;
      $cursor += 86400;
    }
    foreach ($rows as $row) {
      $key = $row['date'];
      if (!isset($series[$key])) {
        $series[$key] = 0;
      }
      $series[$key]++;
    }
  }

  return $series;
}

function analytics_count_values($rows, $field) {
  $counts = array();
  foreach ($rows as $row) {
    $value = isset($row[$field]) ? trim((string) $row[$field]) : '';
    if ($value === '') {
      if ($field === 'referrer_domain') {
        $value = '(directa)';
      } elseif ($field === 'utm_campaign') {
        $value = '(sin campana)';
      } else {
        $value = '(sin dato)';
      }
    }
    if (!isset($counts[$value])) {
      $counts[$value] = 0;
    }
    $counts[$value]++;
  }
  arsort($counts);
  return $counts;
}

function analytics_count_campaigns($rows) {
  $counts = array();
  foreach ($rows as $row) {
    $source = trim((string) $row['utm_source']);
    $medium = trim((string) $row['utm_medium']);
    $campaign = trim((string) $row['utm_campaign']);
    if ($source === '' && $medium === '' && $campaign === '') {
      $label = '(sin campana)';
    } else {
      $parts = array();
      if ($source !== '') {
        $parts[] = $source;
      }
      if ($medium !== '') {
        $parts[] = $medium;
      }
      if ($campaign !== '') {
        $parts[] = $campaign;
      }
      $label = implode(' / ', $parts);
    }
    if (!isset($counts[$label])) {
      $counts[$label] = 0;
    }
    $counts[$label]++;
  }
  arsort($counts);
  return $counts;
}

function analytics_summary_counts() {
  $counter_path = analytics_config('data_dir', dirname(__FILE__) . '/data') . '/counters.tsv';
  $map = analytics_read_counter_map($counter_path);
  $today = date('Y-m-d');
  return array(
    'total' => isset($map['total']) ? intval($map['total']) : 0,
    'today' => isset($map[$today]) ? intval($map[$today]) : 0
  );
}

function analytics_global_auth_md5() {
  $default = '6184cc7a2b2ddb8b4aad60f50df60f72';
  $path = dirname(dirname(__FILE__)) . '/.auth.php';
  if (!file_exists($path)) {
    return $default;
  }
  $loaded = @include $path;
  if (!is_array($loaded) || !isset($loaded['password_md5'])) {
    return $default;
  }
  $hash = strtolower(trim((string) $loaded['password_md5']));
  if (!preg_match('/^[a-f0-9]{32}$/', $hash)) {
    return $default;
  }
  return $hash;
}

function analytics_require_login() {
  session_start();
  if (isset($_COOKIE['analytics_global_auth']) && $_COOKIE['analytics_global_auth'] === analytics_global_auth_md5()) {
    return;
  }
  if (isset($_SESSION['analytics_global_ok']) && $_SESSION['analytics_global_ok'] === '1') {
    return;
  }
  if (isset($_SESSION['analytics_ok']) && $_SESSION['analytics_ok'] === '1') {
    return;
  }

  $error = '';
  if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user = isset($_POST['user']) ? trim($_POST['user']) : '';
    $pass = isset($_POST['pass']) ? trim($_POST['pass']) : '';
    if ($user === analytics_config('admin_user', 'admin') && md5($pass) === analytics_config('admin_password_md5', '')) {
      $_SESSION['analytics_ok'] = '1';
      header('Location: ' . $_SERVER['PHP_SELF'] . (isset($_SERVER['QUERY_STRING']) && $_SERVER['QUERY_STRING'] !== '' ? '?' . $_SERVER['QUERY_STRING'] : ''));
      exit;
    }
    $error = 'Credenciales incorrectas.';
  }

  header('Content-Type: text/html; charset=UTF-8');
  echo '<!doctype html><html><head><meta charset="utf-8"><title>Acceso estadisticas</title><style>body{font-family:Arial,sans-serif;max-width:28rem;margin:4rem auto;padding:0 1rem;background:#f5f7fa;color:#123;}form{background:#fff;border:1px solid #d7dde5;border-radius:12px;padding:1.25rem;box-shadow:0 10px 30px rgba(0,0,0,.06)}label{display:block;margin:.8rem 0 .35rem;font-weight:bold}input{width:100%;box-sizing:border-box;padding:.65rem .75rem;border:1px solid #bcc7d4;border-radius:8px}button{margin-top:1rem;padding:.7rem 1rem;border:0;border-radius:8px;background:#0f5c5c;color:#fff;font-weight:bold;cursor:pointer}.error{color:#a40000;margin:.5rem 0 0}</style></head><body><form method="post"><h1>Estadisticas privadas</h1><p>Introduce las credenciales de esta aplicacion.</p><label for="user">Usuario</label><input id="user" name="user" type="text" autocomplete="username" /><label for="pass">Contrasena</label><input id="pass" name="pass" type="password" autocomplete="current-password" /><button type="submit">Entrar</button>';
  if ($error !== '') {
    echo '<p class="error">' . htmlspecialchars($error, ENT_QUOTES, 'UTF-8') . '</p>';
  }
  echo '</form></body></html>';
  exit;
}
?>
