import { createElement } from './utils';

class RandomBrowser {
  constructor() {
    this.init();
  }

  init() {
    const container = createElement('div', 'random-browser-container');
    const addressBar = createElement('input', 'address-bar');
    addressBar.type = 'text';
    addressBar.placeholder = 'Enter URL';

    const webView = createElement('iframe', 'web-view');

    addressBar.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        webView.src = addressBar.value;
      }
    });

    container.appendChild(addressBar);
    container.appendChild(webView);
    document.body.appendChild(container);
  }
}

export default RandomBrowser;
