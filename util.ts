export function createElement(tag: string, className: string, innerText?: string) {
  const element = document.createElement(tag);
  element.className = className;
  if (innerText) {
    element.innerText = innerText;
  }
  return element;
}

// Additional utility functions for custom alerts, etc.
