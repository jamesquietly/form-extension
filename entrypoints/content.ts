import { FillMessage, FillResponse, LocationMessage, LocationResponse } from './lib/types';

/**
 * Simulates typing into an input element by first pressing backspace twice and then typing the new value
 * @param inputElement - The HTML input element to modify
 * @param value - The value to type into the input
 */
const simulateInput = (inputElement: HTMLInputElement, value: string): void => {
  try {
    // Focus the input element
    inputElement.focus();

    // Select all text in the input to ensure we're replacing the entire value
    inputElement.select();

    // Create and dispatch a keydown event for each character in the value
    for (let i = 0; i < value.length; i++) {
      const char = value[i];
      const keyCode = char.charCodeAt(0);

      // Create and dispatch keydown event
      const keyDownEvent = new KeyboardEvent('keydown', {
        key: char,
        code: `Digit${char}`,
        keyCode: keyCode,
        which: keyCode,
        location: 0,
        repeat: false,
        isComposing: false,
        bubbles: true,
        cancelable: true,
        composed: true
      });

      // Create and dispatch keypress event (some frameworks listen for this)
      const keyPressEvent = new KeyboardEvent('keypress', {
        key: char,
        code: `Digit${char}`,
        keyCode: keyCode,
        which: keyCode,
        charCode: keyCode,
        location: 0,
        repeat: false,
        isComposing: false,
        bubbles: true,
        cancelable: true,
        composed: true
      });

      // Create input event (Angular listens for this)
      const inputEvent = new InputEvent('input', {
        data: char,
        inputType: 'insertText',
        isComposing: false,
        bubbles: true,
        cancelable: true,
        composed: true
      });

      // Dispatch the events in the correct order
      inputElement.dispatchEvent(keyDownEvent);
      inputElement.dispatchEvent(keyPressEvent);

      // Update the input value
      const currentValue = inputElement.value || '';
      inputElement.value =
        currentValue.substring(0, inputElement.selectionStart || 0) +
        char +
        currentValue.substring(inputElement.selectionEnd || 0);

      // Update selection
      const newPosition = (inputElement.selectionStart || 0) + 1;
      inputElement.setSelectionRange(newPosition, newPosition);

      // Dispatch input event after value change
      inputElement.dispatchEvent(inputEvent);
    }

    // Finally, trigger a change event
    const changeEvent = new Event('change', {
      bubbles: true,
      cancelable: true,
      composed: true
    });
    inputElement.dispatchEvent(changeEvent);

    // Also trigger Angular's change detection by dispatching an 'input' event on the form
    const form = inputElement.closest('form');
    if (form) {
      const formInputEvent = new Event('input', { bubbles: true });
      form.dispatchEvent(formInputEvent);
    }
  } catch (error) {
    console.error('Error in simulateInput:', error);
    // Fallback to direct value assignment if simulation fails
    inputElement.value = value;
    // Trigger input and change events
    inputElement.dispatchEvent(new Event('input', { bubbles: true }));
    inputElement.dispatchEvent(new Event('change', { bubbles: true }));
  }
};

type FillParams = {
  hours?: string;
  minutes?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
};

// funciton that takes string like '05', focus HTMLInputElement, press backspace key twice, then press key for input string

export default defineContentScript({
  matches: ['https://*/*'],
  main() {
    const fill = ({ hours, minutes, startTime, endTime }: FillParams) => {
      if (hours) {
        const hourInputs = document.querySelectorAll<HTMLInputElement>('input[id^="hours-"]');
        for (const hour of hourInputs) {
          simulateInput(hour, hours);
        }
      }

      if (minutes) {
        const minuteInputs = document.querySelectorAll<HTMLInputElement>('input[id^="minutes-"]');
        for (const minute of minuteInputs) {
          simulateInput(minute, minutes);
        }
      }

      if (startTime) {
        const startInputs = document.querySelectorAll<HTMLInputElement>('input[id^="starttime-"]');
        for (const start of startInputs) {
          start.value = startTime;
        }
      }

      if (endTime) {
        const endInputs = document.querySelectorAll<HTMLInputElement>('input[id^="endtime-"]');
        for (const end of endInputs) {
          end.value = endTime;
        }
      }
    };

    const handleNextSelect = (location: string, index: number, list: NodeListOf<HTMLSelectElement>) => {
      if (index >= list.length) {
        return;
      }

      const current = list[index];
      current.click();

      setTimeout(() => {
        const options = Array.from(document.querySelectorAll('mat-option')) as HTMLElement[];
        const match = options.find(opt => opt.innerText.trim() === location);
        if (match) {
          match.click();
        }
        setTimeout(() => handleNextSelect(location, index + 1, list), 100);
      }, 100);
    };

    chrome.runtime.onMessage.addListener((message: FillMessage, _, sendResponse: (response: FillResponse) => void) => {
      console.log('message', message);
      const { hours, minutes, startTime, endTime } = message;
      if (message.action === 'fill') {
        fill({ hours, minutes, startTime, endTime });
      }
      if (message.action === 'endLocation') {
      }
      sendResponse({ hours, minutes, startTime, endTime });
    });

    chrome.runtime.onMessage.addListener(
      (message: LocationMessage, _, sendResponse: (response: LocationResponse) => void) => {
        console.log('message', message);
        const { location } = message;
        if (location) {
          if (message.action === 'startLocation') {
            const startSelects = document.querySelectorAll<HTMLSelectElement>(
              'mat-select[id^="start-locationSelect-"]'
            );
            handleNextSelect(location, 0, startSelects);
          }
          if (message.action === 'endLocation') {
            const endSelects = document.querySelectorAll<HTMLSelectElement>('mat-select[id^="end-locationSelect-"]');
            handleNextSelect(location, 0, endSelects);
          }
        }
        sendResponse({ location });
      }
    );
  }
});
