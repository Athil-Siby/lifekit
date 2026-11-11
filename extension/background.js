/* LifeKit service worker: right-click menu shortcuts that open tools on the website.
   Content is passed after "#", which browsers never send to the server. */
importScripts('config.js');

const MAX_TEXT = 100000;

function openTool(slug, params) {
  const hash = params ? '#' + new URLSearchParams(params).toString() : '';
  chrome.tabs.create({ url: `${LIFEKIT_SITE_URL}/tools/${slug}${hash}` });
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({ id: 'count', title: 'Count words in selection – LifeKit', contexts: ['selection'] });
    chrome.contextMenus.create({ id: 'format', title: 'Format selected text – LifeKit', contexts: ['selection'] });
    chrome.contextMenus.create({ id: 'qr-link', title: 'Create QR code for this link – LifeKit', contexts: ['link'] });
    chrome.contextMenus.create({ id: 'qr-page', title: 'Create QR code for this page – LifeKit', contexts: ['page'] });
  });
});

chrome.contextMenus.onClicked.addListener((info) => {
  const text = (info.selectionText || '').slice(0, MAX_TEXT);
  switch (info.menuItemId) {
    case 'count':
      openTool('word-counter', { text });
      break;
    case 'format':
      openTool('text-formatter', { text });
      break;
    case 'qr-link':
      openTool('qr-code-generator', { url: info.linkUrl || '' });
      break;
    case 'qr-page':
      openTool('qr-code-generator', { url: info.pageUrl || '' });
      break;
  }
});
