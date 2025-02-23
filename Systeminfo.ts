export function displayBatteryPercentage() {
  navigator.getBattery().then(function(battery) {
    const batteryPercentage = Math.round(battery.level * 100);
    // Display battery percentage
  }).catch(() => {
    // Display custom alert for battery info not available
  });
}

export function displayDateTime() {
  const date = new Date();
  const dateString = date.toLocaleDateString();
  const timeString = date.toLocaleTimeString();
  // Display date and time
}
