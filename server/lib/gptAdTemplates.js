const GAM_NETWORK = '23344116654';

/** Build a unique GPT display slot for each placement key. */
export function buildGptAdHtml(placement, { unit = 'a1' } = {}) {
  const divId = `div-gpt-ad-${String(placement).replace(/_/g, '-')}`;
  const slotPath = `/${GAM_NETWORK}/${unit}`;
  const sizes =
    unit === 'a2'
      ? '[[200, 200], [480, 320], "fluid", [336, 280], [250, 250], [300, 250]]'
      : '[[336, 280], [250, 250], [300, 250], [200, 200], [480, 320], "fluid"]';

  return `<script async src="https://securepubads.g.doubleclick.net/tag/js/gpt.js" crossorigin="anonymous"></script>
<script>
  window.googletag = window.googletag || {cmd: []};
  googletag.cmd.push(function() {
    googletag.defineSlot('${slotPath}', ${sizes}, '${divId}').addService(googletag.pubads());
    googletag.pubads().enableSingleRequest();
    googletag.enableServices();
  });
</script>
<!-- ${slotPath} -->
<div id='${divId}' style='min-width: 200px; min-height: 200px;'>
  <script>
    googletag.cmd.push(function() { googletag.display('${divId}'); });
  </script>
</div>`;
}
