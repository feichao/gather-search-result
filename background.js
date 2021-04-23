const engines = {
  'google.com': function(url) {
    return getSearchKeywords(url, 'q');
  },
  'baidu.com': function(url) {
    return getSearchKeywords(url, 'wd');
  },
  'bing.com': function(url) {
    return getSearchKeywords(url, 'q');
  }
};
const enginesKey = Object.keys(engines);

function getSearchKeywords(url, key) {
  const urlO = new URL(url);
  const searchs = new URLSearchParams(urlO.search);
  return searchs.get(key);
}

function updateSearchKeywords(url) {
  if(url) {
    const urlO = new URL(url);
    const engineKey = enginesKey.filter(k => urlO.origin.match(new RegExp(k)));
    if(engineKey.length > 0) {
     return engines[engineKey](url);
    }
  }
}

chrome.tabs.onCreated.addListener(function(tab) {
  console.log(updateSearchKeywords(tab.url));
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo) {
  console.log(updateSearchKeywords(changeInfo.url));
});

