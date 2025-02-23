import React, { useEffect, useState } from 'react';
import Head from 'next/head';

const Home: React.FC = () => {
  const [showControlCenter, setShowControlCenter] = useState(false);

  useEffect(() => {
    // Place all the JavaScript code here
    // settings (from localStorage or defaults)
    let settings = {
      tzOffset: parseFloat(localStorage.getItem('tzOffset') || '0') || 0,
      showSeconds: localStorage.getItem('showSeconds') === 'true',
      overrideBattery: localStorage.getItem('overrideBattery') === 'true',
      batteryLevel: parseInt(localStorage.getItem('batteryLevel') || '100') || 100,
      showBattery: localStorage.getItem('showBattery') !== 'false',
      darkMode: localStorage.getItem('darkMode') === 'true',
      signedInUser: localStorage.getItem('signedInUser') || ''
    };
    
    if(settings.darkMode) document.body.classList.add('dark');
    
    // update time (12-hour clock with timezone offset)
    function updateTime() {
      const now = new Date();
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const localTime = new Date(utc + settings.tzOffset * 3600000);
      let hours = localTime.getHours();
      const minutes = localTime.getMinutes();
      const seconds = localTime.getSeconds();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      let timeStr = (hours < 10 ? '0' + hours : hours) + ':' + (minutes < 10 ? '0' + minutes : minutes);
      if(settings.showSeconds) timeStr += ':' + (seconds < 10 ? '0' + seconds : seconds);
      timeStr += ' ' + ampm;
      const timeDisplay = document.getElementById('timeDisplay');
      if (timeDisplay) timeDisplay.innerText = timeStr;
    }
    setInterval(updateTime, 1000);
    updateTime();
    
    // update battery display
    function updateBatteryDisplay() {
      const batteryDisplay = document.getElementById('batteryDisplay');
      if (!batteryDisplay) return;

      if(!settings.showBattery) {
        batteryDisplay.innerText = '';
        return;
      }
      if(settings.overrideBattery) {
        batteryDisplay.innerText = settings.batteryLevel + '%';
      } else if(navigator.getBattery) {
        navigator.getBattery().then(battery => {
          const level = Math.floor(battery.level * 100);
          const charging = battery.charging ? ' ⚡' : '';
          batteryDisplay.innerText = level + '%' + charging;
        });
      } else {
        batteryDisplay.innerText = 'N/A';
      }
    }
    setInterval(updateBatteryDisplay, 1000);
    updateBatteryDisplay();
    
    const windowsContainer = document.getElementById('windowsContainer');
    const homeScreen = document.getElementById('homeScreen');
    
    // make element draggable (for windows & home icons)
    function makeDraggable(el) {
      let offsetX = 0, offsetY = 0, dragging = false;
      let header = el.querySelector('.app-header') || el;
      header.style.cursor = 'move';
      
      header.addEventListener('mousedown', startDrag);
      header.addEventListener('touchstart', startDrag);
      
      function startDrag(e) {
        dragging = true;
        const evt = e.type === 'touchstart' ? e.touches[0] : e;
        offsetX = evt.clientX - el.offsetLeft;
        offsetY = evt.clientY - el.offsetTop;
        document.addEventListener('mousemove', drag);
        document.addEventListener('touchmove', drag);
        document.addEventListener('mouseup', stopDrag);
        document.addEventListener('touchend', stopDrag);
      }
      
      function drag(e) {
        if(!dragging) return;
        const evt = e.type === 'touchmove' ? e.touches[0] : e;
        let x = evt.clientX - offsetX;
        let y = evt.clientY - offsetY;
        x = Math.max(0, Math.min(x, window.innerWidth - el.offsetWidth));
        y = Math.max(0, Math.min(y, window.innerHeight - el.offsetHeight));
        el.style.left = x + 'px';
        el.style.top = y + 'px';
      }
      
      function stopDrag() {
        dragging = false;
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('touchmove', drag);
      }
    }
    
    // make element resizable
    function makeResizable(el) {
      const resizeHandle = el.querySelector('.resize-handle');
      let startX, startY, startWidth, startHeight;

      function startResize(e) {
        startX = e.clientX;
        startY = e.clientY;
        startWidth = parseInt(getComputedStyle(el).width, 10);
        startHeight = parseInt(getComputedStyle(el).height, 10);
        document.addEventListener('mousemove', resize);
        document.addEventListener('mouseup', stopResize);
      }

      function resize(e) {
        const newWidth = startWidth + e.clientX - startX;
        const newHeight = startHeight + e.clientY - startY;
        el.style.width = newWidth + 'px';
        el.style.height = newHeight + 'px';
      }

      function stopResize() {
        document.removeEventListener('mousemove', resize);
        document.removeEventListener('mouseup', stopResize);
      }

      resizeHandle.addEventListener('mousedown', startResize);
    }
    
    // open app window
    function openApp(app) {
      const win = document.createElement('div');
      win.className = 'app-window';
      win.style.left = (window.innerWidth/2 - 200) + 'px';
      win.style.top = (window.innerHeight/2 - 150) + 'px';
      win.style.width = '400px';
      win.style.height = '300px';
      
      // header with mac-like controls
      const header = document.createElement('div');
      header.className = 'app-header';
      const title = document.createElement('div');
      title.innerText = app.charAt(0).toUpperCase() + app.slice(1);
      const controls = document.createElement('div');
      controls.className = 'window-controls';
      
      const closeBtn = document.createElement('div');
      closeBtn.className = 'window-control close-btn';
      closeBtn.addEventListener('click', () => windowsContainer?.removeChild(win));
      
      const minimizeBtn = document.createElement('div');
      minimizeBtn.className = 'window-control minimize-btn';
      minimizeBtn.addEventListener('click', () => win.style.display = 'none');
      
      const maximizeBtn = document.createElement('div');
      maximizeBtn.className = 'window-control maximize-btn';
      maximizeBtn.addEventListener('click', () => {
        win.style.left = '10px';
        win.style.top = '50px';
        win.style.width = (window.innerWidth - 20) + 'px';
        win.style.height = (window.innerHeight - 100) + 'px';
      });
      
      controls.appendChild(closeBtn);
      controls.appendChild(minimizeBtn);
      controls.appendChild(maximizeBtn);
      header.appendChild(title);
      header.appendChild(controls);
      win.appendChild(header);
      
      const content = document.createElement('div');
      content.className = 'app-content';
      win.appendChild(content);
      
      // Add resize handle
      const resizeHandle = document.createElement('div');
      resizeHandle.className = 'resize-handle';
      win.appendChild(resizeHandle);
      
      // load app content
      if(app === 'notes') {
        const textarea = document.createElement('textarea');
        textarea.placeholder = 'Type your notes...';
        textarea.value = localStorage.getItem('notesData') || '';
        const saveBtn = document.createElement('button');
        saveBtn.innerText = 'Save';
        saveBtn.addEventListener('click', () => {
          localStorage.setItem('notesData', textarea.value);
          alert('Notes saved!');
        });
        content.appendChild(textarea);
        content.appendChild(saveBtn);
      } else if(app === 'calc') {
        content.innerHTML = `
          <div class="calc-display">0</div>
          <div class="calc-buttons">
            <button>C</button><button>±</button><button>%</button><button>÷</button>
            <button>7</button><button>8</button><button>9</button><button>×</button>
            <button>4</button><button>5</button><button>6</button><button>-</button>
            <button>1</button><button>2</button><button>3</button><button>+</button>
            <button class="zero">0</button><button>.</button><button>=</button>
          </div>
        `;
        let display = content.querySelector('.calc-display');
        let current = '0';
        let operation = null;
        let previous = null;
        content.querySelectorAll('button').forEach(btn => {
          btn.addEventListener('click', () => {
            const val = btn.textContent;
            if('0123456789.'.includes(val)) {
              current = current === '0' ? val : current + val;
            } else if('+-×÷'.includes(val)) {
              operation = val;
              previous = current;
              current = '0';
            } else if(val === '=') {
              if(operation && previous) {
                const a = parseFloat(previous);
                const b = parseFloat(current);
                switch(operation) {
                  case '+': current = (a + b).toString(); break;
                  case '-': current = (a - b).toString(); break;
                  case '×': current = (a * b).toString(); break;
                  case '÷': current = (a / b).toString(); break;
                }
                operation = null;
                previous = null;
              }
            } else if(val === 'C') {
              current = '0';
              operation = null;
              previous = null;
            }
            display.textContent = current;
          });
        });
      } else if(app === 'browser') {
        const browserHeader = document.createElement('div');
        browserHeader.className = 'browser-header';
        browserHeader.innerHTML = `
          <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Untitled132_20250206191635-ryhaaui4j3V7ofIp8ElRti1r1BTjJw.png" class="browser-logo" alt="RandomBrowser">
          <div class="browser-search">
            <input type="text" placeholder="Search RandomBrowser or enter URL">
            <button>🔍</button>
          </div>
        `;
        const webview = document.createElement('iframe');
        webview.style.width = '100%';
        webview.style.height = 'calc(100% - 50px)';
        webview.style.border = 'none';
        browserHeader.querySelector('button').addEventListener('click', () => {
          const input = browserHeader.querySelector('input');
          let url = input.value;
          if(!url.startsWith('http')) url = 'https://google.com/search?q=' + encodeURIComponent(url);
          webview.src = url;
        });
        content.appendChild(browserHeader);
        content.appendChild(webview);
      } else if(app === 'settings') {
        // settings app with tabs
        const tabsContainer = document.createElement('div');
        tabsContainer.className = 'settings-tabs';
        const tabs = ['general', 'network', 'appearance', 'customization'];
        tabs.forEach(tab => {
          const btn = document.createElement('button');
          btn.className = 'tab-btn';
          btn.innerText = tab.charAt(0).toUpperCase() + tab.slice(1);
          btn.dataset.tab = tab;
          btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
            const activeTab = document.getElementById(tab + '-tab');
            if (activeTab) activeTab.classList.add('active');
          });
          tabsContainer.appendChild(btn);
        });
        content.appendChild(tabsContainer);
        
        // General Tab
        const generalTab = document.createElement('div');
        generalTab.className = 'tab-content active';
        generalTab.id = 'general-tab';
        
        // Clock Settings
        const clockSection = document.createElement('div');
        clockSection.className = 'settings-section';
        const clockTitle = document.createElement('h3');
        clockTitle.innerText = 'Clock Settings';
        const tzLabel = document.createElement('label');
        tzLabel.innerText = 'Time Zone Offset (hours):';
        const tzInput = document.createElement('input');
        tzInput.type = 'number';
        tzInput.step = '0.1';
        tzInput.value = settings.tzOffset.toString();
        clockSection.appendChild(clockTitle);
        clockSection.appendChild(tzLabel);
        clockSection.appendChild(tzInput);
        
        const secondsLabel = document.createElement('label');
        secondsLabel.innerText = 'Show Seconds:';
        const secondsSwitch = document.createElement('label');
        secondsSwitch.className = 'switch';
        const secondsCheckbox = document.createElement('input');
        secondsCheckbox.type = 'checkbox';
        secondsCheckbox.checked = settings.showSeconds;
        const secondsSlider = document.createElement('span');
        secondsSlider.className = 'slider';
        secondsSwitch.appendChild(secondsCheckbox);
        secondsSwitch.appendChild(secondsSlider);
        secondsLabel.appendChild(secondsSwitch);
        clockSection.appendChild(secondsLabel);
        generalTab.appendChild(clockSection);
        
        // Battery Settings
        const batterySection = document.createElement('div');
        batterySection.className = 'settings-section';
        const batteryTitle = document.createElement('h3');
        batteryTitle.innerText = 'Battery Settings';
        const overrideLabel = document.createElement('label');
        overrideLabel.innerText = 'Override Battery Level:';
        const overrideSwitch = document.createElement('label');
        overrideSwitch.className = 'switch';
        const overrideCheckbox = document.createElement('input');
        overrideCheckbox.type = 'checkbox';
        overrideCheckbox.checked = settings.overrideBattery;
        const overrideSlider = document.createElement('span');
        overrideSlider.className = 'slider';
        overrideSwitch.appendChild(overrideCheckbox);
        overrideSwitch.appendChild(overrideSlider);
        overrideLabel.appendChild(overrideSwitch);
        batterySection.appendChild(batteryTitle);
        batterySection.appendChild(overrideLabel);
        const batteryInputLabel = document.createElement('label');
        batteryInputLabel.innerText = 'Battery Level (%):';
        const batteryInput = document.createElement('input');
        batteryInput.type = 'number';
        batteryInput.min = '0';
        batteryInput.max = '100';
        batteryInput.value = settings.batteryLevel.toString();
        batterySection.appendChild(batteryInputLabel);
        batterySection.appendChild(batteryInput);
        const showBatteryLabel = document.createElement('label');
        showBatteryLabel.innerText = 'Show Battery Percentage:';
        const showBatterySwitch = document.createElement('label');
        showBatterySwitch.className = 'switch';
        const showBatteryCheckbox = document.createElement('input');
        showBatteryCheckbox.type = 'checkbox';
        showBatteryCheckbox.checked = settings.showBattery;
        const showBatterySlider = document.createElement('span');
        showBatterySlider.className = 'slider';
        showBatterySwitch.appendChild(showBatteryCheckbox);
        showBatterySwitch.appendChild(showBatterySlider);
        showBatteryLabel.appendChild(showBatterySwitch);
        batterySection.appendChild(showBatteryLabel);
        generalTab.appendChild(batterySection);
        
        // Account Settings
        const accountSection = document.createElement('div');
        accountSection.className = 'settings-section';
        const accountTitle = document.createElement('h3');
        accountTitle.innerText = 'Account';
        accountSection.appendChild(accountTitle);
        if(settings.signedInUser) {
          const signedInDiv = document.createElement('div');
          signedInDiv.innerText = 'Signed in as: ' + settings.signedInUser;
          const signOutBtn = document.createElement('button');
          signOutBtn.innerText = 'Sign Out';
          signOutBtn.addEventListener('click', () => {
            settings.signedInUser = '';
            localStorage.removeItem('signedInUser');
            alert('Signed out');
            openApp('settings');
          });
          accountSection.appendChild(signedInDiv);
          accountSection.appendChild(signOutBtn);
        } else {
          const userLabel = document.createElement('label');
          userLabel.innerText = 'Username:';
          const userInput = document.createElement('input');
          userInput.type = 'text';
          const passLabel = document.createElement('label');
          passLabel.innerText = 'Password:';
          const passInput = document.createElement('input');
          passInput.type = 'password';
          const signInBtn = document.createElement('button');
          signInBtn.innerText = 'Sign In';
          signInBtn.addEventListener('click', () => {
            if(userInput.value.trim() === 'ARandomDumDev' && passInput.value.trim() === 'ARandomDumPassword'){
              settings.signedInUser = userInput.value.trim();
              localStorage.setItem('signedInUser', settings.signedInUser);
              alert('Signed in as ' + settings.signedInUser + ' (Developer)');
              openApp('settings');
            } else if(userInput.value.trim() !== '' && passInput.value.trim() !== ''){
              settings.signedInUser = userInput.value.trim();
              localStorage.setItem('signedInUser', settings.signedInUser);
              alert('Signed in as ' + settings.signedInUser);
              openApp('settings');
            } else {
              alert('Please enter username and password');
            }
          });
          accountSection.appendChild(userLabel);
          accountSection.appendChild(userInput);
          accountSection.appendChild(passLabel);
          accountSection.appendChild(passInput);
          accountSection.appendChild(signInBtn);
        }
        generalTab.appendChild(accountSection);

        // Download RandomOS
        const downloadSection = document.createElement('div');
        downloadSection.className = 'settings-section';
        const downloadTitle = document.createElement('h3');
        downloadTitle.innerText = 'Download RandomOS';
        const downloadBtn = document.createElement('button');
        downloadBtn.innerText = 'Download RandomOS';
        downloadBtn.addEventListener('click', generateDownloadableContent);
        downloadSection.appendChild(downloadTitle);
        downloadSection.appendChild(downloadBtn);
        generalTab.appendChild(downloadSection);
        
        // Network Tab (WiFi & Bluetooth dummy toggles)
        const networkTab = document.createElement('div');
        networkTab.className = 'tab-content';
        networkTab.id = 'network-tab';
        const wifiSection = document.createElement('div');
        wifiSection.className = 'settings-section';
        const wifiLabel = document.createElement('label');
        wifiLabel.innerText = 'WiFi:';
        const wifiSwitch = document.createElement('label');
        wifiSwitch.className = 'switch';
        const wifiCheckbox = document.createElement('input');
        wifiCheckbox.type = 'checkbox';
        wifiCheckbox.checked = true;
        const wifiSlider = document.createElement('span');
        wifiSlider.className = 'slider';
        wifiSwitch.appendChild(wifiCheckbox);
        wifiSwitch.appendChild(wifiSlider);
        wifiLabel.appendChild(wifiSwitch);
        wifiSection.appendChild(wifiLabel);
        networkTab.appendChild(wifiSection);
        
        const bluetoothSection = document.createElement('div');
        bluetoothSection.className = 'settings-section';
        const btLabel = document.createElement('label');
        btLabel.innerText = 'Bluetooth:';
        const btSwitch = document.createElement('label');
        btSwitch.className = 'switch';
        const btCheckbox = document.createElement('input');
        btCheckbox.type = 'checkbox';
        btCheckbox.checked = false;
        const btSlider = document.createElement('span');
        btSlider.className = 'slider';
        btSwitch.appendChild(btCheckbox);
        btSwitch.appendChild(btSlider);
        btLabel.appendChild(btSwitch);
        bluetoothSection.appendChild(btLabel);
        networkTab.appendChild(bluetoothSection);
        
        // Appearance Tab (Dark mode & Wallpaper)
        const appearanceTab = document.createElement('div');
        appearanceTab.className = 'tab-content';
        appearanceTab.id = 'appearance-tab';
        const appearanceSection = document.createElement('div');
        appearanceSection.className = 'settings-section';
        const darkModeLabel = document.createElement('label');
        darkModeLabel.innerText = 'Dark Mode:';
        const darkModeSwitch = document.createElement('label');
        darkModeSwitch.className = 'switch';
        const darkModeCheckbox = document.createElement('input');
        darkModeCheckbox.type = 'checkbox';
        darkModeCheckbox.checked = settings.darkMode;
        const darkModeSlider = document.createElement('span');
        darkModeSlider.className = 'slider';
        darkModeSwitch.appendChild(darkModeCheckbox);
        darkModeSwitch.appendChild(darkModeSlider);
        darkModeLabel.appendChild(darkModeSwitch);
        appearanceSection.appendChild(darkModeLabel);
        const wallpaperLabel = document.createElement('label');
        wallpaperLabel.innerText = 'Wallpaper Color:';
        const wallpaperInput = document.createElement('input');
        wallpaperInput.type = 'color';
        wallpaperInput.value = '#f0f0f5';
        appearanceSection.appendChild(wallpaperLabel);
        appearanceSection.appendChild(wallpaperInput);
        appearanceTab.appendChild(appearanceSection);
        
        // Customization Tab (placeholder)
        const customizationTab = document.createElement('div');
        customizationTab.className = 'tab-content';
        customizationTab.id = 'customization-tab';
        const customSection = document.createElement('div');
        customSection.className = 'settings-section';
        customSection.innerHTML = '<h3>Customization</h3><p>More options coming soon...</p>';
        customizationTab.appendChild(customSection);
        
        content.appendChild(generalTab);
        content.appendChild(networkTab);
        content.appendChild(appearanceTab);
        content.appendChild(customizationTab);
        
        // Save Settings Button
        const saveSettingsBtn = document.createElement('button');
        saveSettingsBtn.innerText = 'Save Settings';
        saveSettingsBtn.addEventListener('click', () => {
          settings.tzOffset = parseFloat(tzInput.value) || 0;
          settings.showSeconds = secondsCheckbox.checked;
          settings.overrideBattery = overrideCheckbox.checked;
          settings.batteryLevel = parseInt(batteryInput.value) || 100;
          settings.showBattery = showBatteryCheckbox.checked;
          settings.darkMode = darkModeCheckbox.checked;
          localStorage.setItem('tzOffset', settings.tzOffset.toString());
          localStorage.setItem('showSeconds', settings.showSeconds.toString());
          localStorage.setItem('overrideBattery', settings.overrideBattery.toString());
          localStorage.setItem('batteryLevel', settings.batteryLevel.toString());
          localStorage.setItem('showBattery', settings.showBattery.toString());
          localStorage.setItem('darkMode', settings.darkMode.toString());
          if(settings.darkMode) {
            document.body.classList.add('dark');
          } else {
            document.body.classList.remove('dark');
          }
          localStorage.setItem('wallpaper', wallpaperInput.value);
          alert('Settings saved!');
          updateTime();
          updateBatteryDisplay();
        });
        content.appendChild(saveSettingsBtn);

        // Add dev features if signed in as developer
        if (settings.signedInUser === 'ARandomDumDev') {
          const devFeaturesSection = document.createElement('div');
          devFeaturesSection.className = 'settings-section';
          const devFeaturesTitle = document.createElement('h3');
          devFeaturesTitle.innerText = 'Developer Features';
          const devFeaturesList = document.createElement('ul');
          devFeaturesList.innerHTML = `
            <li>Console Access</li>
            <li>Performance Metrics</li>
            <li>Debug Mode</li>
          `;
          devFeaturesSection.appendChild(devFeaturesTitle);
          devFeaturesSection.appendChild(devFeaturesList);
          generalTab.appendChild(devFeaturesSection);
        }
      }
      
      windowsContainer?.appendChild(win);
      makeDraggable(win);
      makeResizable(win);
    }
    
    // attach dock icon events
    document.querySelectorAll('.dock-icon').forEach(icon => {
      icon.addEventListener('click', () => {
        openApp(icon.dataset.app || '');
      });
      // long press to clone icon onto home screen
      let pressTimer: number;
      icon.addEventListener('mousedown', (e) => {
        pressTimer = window.setTimeout(() => {
          const clone = icon.cloneNode(true) as HTMLElement;
          clone.classList.add('home-icon');
          clone.style.left = (e.clientX - 30) + 'px';
          clone.style.top = (e.clientY - 30) + 'px';
          clone.addEventListener('click', () => openApp(clone.dataset.app || ''));
          homeScreen?.appendChild(clone);
          makeDraggable(clone);
        }, 600);
      });
      icon.addEventListener('mouseup', () => clearTimeout(pressTimer));
      icon.addEventListener('mouseout', () => clearTimeout(pressTimer));
    });

    function generateDownloadableContent() {
      const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RandomOS</title>
  <style>
    ${document.querySelector('style')?.innerHTML}
  </style>
</head>
<body>
  <div id="statusBar">
    <div id="timeDisplay">--:--</div>
    <div id="batteryDisplay">--%</div>
  </div>
  <div id="homeScreen"></div>
  <div id="windowsContainer"></div>
  <div id="dock">
    <div class="dock-icon" data-app="notes">📝</div>
    <div class="dock-icon" data-app="calc">🧮</div>
    <div class="dock-icon" data-app="browser">🌐</div>
    <div class="dock-icon" data-app="settings">⚙️</div>
  </div>
  <script>
    ${document.querySelector('script')?.innerHTML}
  </script>
</body>
</html>
      `;

      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'RandomOS.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    // Update the status bar layout
    const statusBar = document.getElementById('statusBar');
    if (statusBar) {
      statusBar.innerHTML = `
        <div id="timeDisplay">--:--</div>
        <div class="control-center-trigger">
          <span>⌃</span>
        </div>
        <div id="batteryDisplay">--%</div>
      `;
      const controlCenterTrigger = statusBar.querySelector('.control-center-trigger');
      if (controlCenterTrigger) {
        controlCenterTrigger.addEventListener('click', () => setShowControlCenter(true));
      }
    }
  }, [setShowControlCenter]);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>RandomOS</title>
      </Head>
      <div id="statusBar">
        <div id="timeDisplay">--:--</div>
        <div className="control-center-trigger">
          <span>⌃</span>
        </div>
        <div id="batteryDisplay">--%</div>
      </div>
      <div id="homeScreen"></div>
      <div id="windowsContainer"></div>
      <div id="dock">
        <div className="dock-icon" data-app="notes">📝</div>
        <div className="dock-icon" data-app="calc">🧮</div>
        <div className="dock-icon" data-app="browser">🌐</div>
        <div className="dock-icon" data-app="settings">⚙️</div>
      </div>
      <style jsx global>{`
        /* Basic styles */
        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          background: #f0f0f5;
          color: #333;
          transition: background 0.3s, color 0.3s;
          position: relative;
          overflow: hidden;
        }
        body.dark {
          background: #1e1e1e;
          color: #ddd;
        }
        /* Status Bar */
        #statusBar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          padding: 10px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(255,255,255,0.8);
          border-bottom: 1px solid #ccc;
          z-index: 1000;
          transition: background 0.3s, border-color 0.3s;
        }
        body.dark #statusBar {
          background: rgba(40,40,40,0.8);
          border-bottom: 1px solid #555;
        }
        /* Home Screen */
        #homeScreen {
          position: absolute;
          top: 60px;
          left: 0;
          right: 0;
          bottom: 80px;
          z-index: 1;
        }
        .home-icon {
          position: absolute;
          width: 60px;
          height: 60px;
          background: #fff;
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          cursor: pointer;
          user-select: none;
          transition: transform 0.2s;
        }
        .home-icon:hover {
          transform: scale(1.1);
        }
        body.dark .home-icon {
          background: #333;
        }
        /* Dock */
        #dock {
          position: fixed;
          bottom: 10px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(255,255,255,0.8);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 10px;
          display: flex;
          gap: 20px;
          z-index: 1000;
          transition: background 0.3s;
        }
        body.dark #dock {
          background: rgba(40,40,40,0.8);
        }
        .dock-icon {
          width: 60px;
          height: 60px;
          background: #fff;
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          cursor: pointer;
          position: relative;
          user-select: none;
          transition: transform 0.2s;
        }
        .dock-icon:hover {
          transform: scale(1.1);
        }
        body.dark .dock-icon {
          background: #333;
        }
        /* App Window */
        .app-window {
          position: absolute;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 8px 20px rgba(0,0,0,0.2);
          width: 90%;
          max-width: 400px;
          transition: left 0.1s ease, top 0.1s ease;
          overflow: hidden;
          z-index: 2000;
        }
        body.dark .app-window {
          background: #2e2e2e;
          color: #ddd;
        }
        .app-header {
          background: #f7f7f7;
          padding: 8px 10px;
          cursor: move;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        body.dark .app-header {
          background: #3a3a3a;
        }
        .window-controls {
          display: flex;
          gap: 5px;
        }
        .window-control {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          cursor: pointer;
        }
        .close-btn { background: #ff5f57; }
        .minimize-btn { background: #ffbd2e; }
        .maximize-btn { background: #28c940; }
        .app-content {
          padding: 15px;
          overflow: auto;
          height: calc(100% - 40px);
        }
        textarea, input, button {
          font-family: inherit;
        }
        textarea {
          width: 100%;
          height: 120px;
          border: 1px solid #ccc;
          border-radius: 8px;
          padding: 8px;
          resize: none;
          background: #fff;
        }
        body.dark textarea {
          background: #444;
          color: #ddd;
          border: 1px solid #555;
        }
        button {
          background: #007aff;
          color: #fff;
          border: none;
          padding: 8px 12px;
          border-radius: 8px;
          cursor: pointer;
          margin-top: 8px;
        }
        input[type="number"], input[type="text"], input[type="password"] {
          width: calc(100% - 10px);
          padding: 6px;
          margin: 4px 0;
          border: 1px solid #ccc;
          border-radius: 6px;
        }
        body.dark input {
          background: #555;
          color: #ddd;
          border: 1px solid #666;
        }
        /* Toggle Switch CSS */
        .switch {
          position: relative;
          display: inline-block;
          width: 40px;
          height: 20px;
          margin-left: 10px;
        }
        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: #ccc;
          transition: 0.4s;
          border-radius: 20px;
        }
        .slider:before {
          position: absolute;
          content: "";
          height: 16px;
          width: 16px;
          left: 2px;
          bottom: 2px;
          background-color: white;
          transition: 0.4s;
          border-radius: 50%;
        }
        input:checked + .slider {
          background-color: #007aff;
        }
        input:checked + .slider:before {
          transform: translateX(20px);
        }
        /* Settings Tabs */
        .settings-tabs {
          display: flex;
          gap: 10px;
          margin-bottom: 10px;
        }
        .tab-btn {
          padding: 6px 12px;
          border: none;
          border-bottom: 2px solid transparent;
          background: none;
          cursor: pointer;
          font-size: 14px;
        }
        .tab-btn.active {
          border-color: #007aff;
          font-weight: bold;
        }
        .tab-content {
          display: none;
        }
        .tab-content.active {
          display: block;
        }
        .settings-section {
          margin-bottom: 15px;
        }
        .settings-section h3 {
          margin-bottom: 8px;
        }
        .resize-handle {
          position: absolute;
          right: 0;
          bottom: 0;
          width: 10px;
          height: 10px;
          cursor: se-resize;
          background: rgba(0, 122, 255, 0.3);
        }
        .browser-header {
          display: flex;
          align-items: center;
          padding: 10px;
          gap: 10px;
          border-bottom: 1px solid #ccc;
        }
        .browser-logo {
          height: 24px;
          width: 24px;
        }
        .browser-search {
          flex: 1;
          display: flex;
          gap: 5px;
        }
        .browser-search input {
          flex: 1;
          padding: 5px 10px;
          border-radius: 20px;
          border: 1px solid #ccc;
        }
        .calc-display {
          padding: 20px;
          text-align: right;
          font-size: 32px;
          border-bottom: 1px solid #eee;
        }
        .calc-buttons {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1px;
          background: #eee;
        }
        .calc-buttons button {
          padding: 20px;
          border: none;
          background: white;
          font-size: 20px;
          margin: 0;
        }
        .calc-buttons .zero {
          grid-column: span 2;
        }
      `}</style>
    </>
  );
};

export default Home;
