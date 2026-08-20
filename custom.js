(function () {
  const shortcuts = {
    gh:   'https://github.com/search?q={query}',
    leo:  'https://dict.leo.org/german-english/{query}',
    maps: 'https://www.google.com/maps/search/{query}',
    r:    'https://www.reddit.com/search/?q={query}',
    wiki: 'https://en.wikipedia.org/w/index.php?search={query}',
    yf:   'https://finance.yahoo.com/quote/{query}',
    yt:   'https://www.youtube.com/results?search_query={query}',
  };

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') return;
    const input = document.activeElement;
    if (!input || input.tagName !== 'INPUT') return;

    const val = input.value.trim();
    const spaceIdx = val.indexOf(' ');
    if (spaceIdx === -1) return;

    const keyword = val.slice(0, spaceIdx);
    const query = val.slice(spaceIdx + 1).trim();
    const url = shortcuts[keyword];
    if (!url || !query) return;

    e.stopImmediatePropagation();
    e.preventDefault();
    window.location.href = url.replace('{query}', encodeURIComponent(query));
  }, true);
})();
