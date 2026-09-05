// Preloaded only by CLI integration tests. No requests leave the process.
globalThis.fetch = async () => {
  process.stderr.write('TEST_UPDATE_REQUEST\n');
  return Response.json({
    tag_name: 'v999.0.0',
    html_url: 'https://github.com/eXeConvert/eXeConvert.github.io/releases/tag/v999.0.0',
    prerelease: false, draft: false, assets: [],
  });
};
