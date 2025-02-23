export function login(username: string, password: string) {
  if (username === 'ARandomDumDev' && password === 'ARandomDumPass') {
    enableDevControls();
    return true;
  }
  return false;
}

function enableDevControls() {
  // Implement developer controls
}
