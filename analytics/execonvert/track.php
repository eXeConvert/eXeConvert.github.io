<?php
require_once dirname(__FILE__) . '/lib.php';
analytics_init_timezone();

$callback = isset($_GET['callback']) ? $_GET['callback'] : '';
$page_url = isset($_GET['page_url']) ? analytics_safe_value($_GET['page_url']) : '';
$referrer = isset($_GET['referrer']) ? analytics_safe_value($_GET['referrer']) : '';
$utm_source = isset($_GET['utm_source']) ? analytics_safe_value($_GET['utm_source']) : '';
$utm_medium = isset($_GET['utm_medium']) ? analytics_safe_value($_GET['utm_medium']) : '';
$utm_campaign = isset($_GET['utm_campaign']) ? analytics_safe_value($_GET['utm_campaign']) : '';

if (!analytics_is_bot()) {
  $ts = time();
  $date_key = date('Y-m-d', $ts);
  $hour_key = date('H', $ts);
  $source_type = analytics_classify_source($referrer, $utm_source, $utm_medium, $utm_campaign);
  $referrer_domain = analytics_parse_url_host($referrer);

  analytics_append_event(array(
    $ts,
    $date_key,
    $hour_key,
    $source_type,
    analytics_safe_value($referrer_domain),
    $referrer,
    $utm_source,
    $utm_medium,
    $utm_campaign
  ));
  analytics_increment_counters($date_key);
}

$summary = analytics_summary_counts();
$payload = array(
  'ok' => true,
  'site' => analytics_config('site_id', 'execonvert'),
  'total' => intval($summary['total']),
  'today' => intval($summary['today'])
);

analytics_output_jsonp($payload, $callback);
?>
