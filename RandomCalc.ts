import { createElement } from './utils';

class RandomCalc {
  constructor() {
    this.init();
  }

  init() {
    const container = createElement('div', 'random-calc-container');
    const display = createElement('input', 'calc-display');
    display.type = 'text';
    display.disabled = true;

    const buttons = [
      '7', '8', '9', '/',
      '4', '5', '6', '*',
      '1', '2', '3', '-',
      '0', '.', '=', '+'
    ];

    buttons.forEach(buttonText => {
      const button = createElement('button', 'calc-button', buttonText);
      button.addEventListener('click', () => this.onButtonClick(buttonText));
      container.appendChild(button);
    });

    container.appendChild(display);
    document.body.appendChild(container);
  }

  onButtonClick(buttonText: string) {
    // Implement calculator logic here
  }
}

export default RandomCalc;
