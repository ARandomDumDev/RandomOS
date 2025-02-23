import { createElement } from './utils';

class RandomSettings {
  constructor() {
    this.init();
  }

  init() {
    // Create main container
    const container = createElement('div', 'random-settings-container');

    // Create tabs
    const appearanceTab = this.createAppearanceTab();
    const loginTab = this.createLoginTab();

    container.appendChild(appearanceTab);
    container.appendChild(loginTab);

    document.body.appendChild(container);
  }

  createAppearanceTab() {
    const tab = createElement('div', 'tab', 'Appearance');
    // Add dark mode toggle
    const darkModeToggle = createElement('input', 'dark-mode-toggle');
    darkModeToggle.type = 'checkbox';
    tab.appendChild(darkModeToggle);

    // Add wallpaper change options
    const wallpaperInput = createElement('input', 'wallpaper-input');
    wallpaperInput.type = 'file';
    tab.appendChild(wallpaperInput);

    return tab;
  }

  createLoginTab() {
    const tab = createElement('div', 'tab', 'Login');
    // Add login form
    const loginForm = createElement('form', 'login-form');
    const usernameInput = createElement('input', 'username-input');
    usernameInput.placeholder = 'Username';
    const passwordInput = createElement('input', 'password-input');
    passwordInput.type = 'password';
    passwordInput.placeholder = 'Password';
    const loginButton = createElement('button', 'login-button', 'Login');

    loginForm.appendChild(usernameInput);
    loginForm.appendChild(passwordInput);
    loginForm.appendChild(loginButton);

    tab.appendChild(loginForm);

    return tab;
  }
}

export default RandomSettings;
