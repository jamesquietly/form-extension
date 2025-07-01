import { FillMessage, FillResponse, LocationMessage, LocationResponse } from './lib/types';

/**
 * Simulates typing into an input element with proper event dispatching
 * @param inputElement - The HTML input element to modify
 * @param value - The value to set in the input
 */
const simulateInput = (inputElement: HTMLInputElement, value: string): void => {
  try {
    // Focus and select the input
    inputElement.focus();
    inputElement.select();
    
    // Set the value directly
    inputElement.value = value;
    
    // Create and dispatch input event
    const inputEvent = new Event('input', {
      bubbles: true,
      cancelable: true,
      composed: true
    });
    inputElement.dispatchEvent(inputEvent);
    
    // Create and dispatch change event
    const changeEvent = new Event('change', {
      bubbles: true,
      cancelable: true,
      composed: true
    });
    inputElement.dispatchEvent(changeEvent);
    
    // Try to trigger Angular's change detection if it's an Angular control
    const angularInput = inputElement as any;
    if (angularInput.ngModel) {
      const ctrl = angularInput.ngModel.control;
      if (ctrl) {
        ctrl.setValue(value);
        ctrl.updateValueAndValidity();
      }
    }
    
    // Also trigger on the form if it exists
    const form = inputElement.closest('form');
    if (form) {
      // Try to find Angular form
      const ngForm = (form as any).ngForm;
      if (ngForm && ngForm.control) {
        ngForm.control.updateValueAndValidity();
      }
      
      // Dispatch standard form events
      form.dispatchEvent(new Event('input', { bubbles: true }));
      form.dispatchEvent(new Event('change', { bubbles: true }));
    }
    
    // If we have a ViewContainerRef, try to trigger change detection
    if ((window as any).ng) {
      try {
        const component = (window as any).ng.getComponent(inputElement);
        if (component && component.changeDetectorRef) {
          component.changeDetectorRef.detectChanges();
        }
      } catch (e) {
        console.log('Could not trigger Angular change detection');
      }
    }
    
  } catch (error) {
    console.error('Error in simulateInput:', error);
    // Fallback to direct value assignment if simulation fails
    inputElement.value = value;
    inputElement.dispatchEvent(new Event('input', { bubbles: true }));
    inputElement.dispatchEvent(new Event('change', { bubbles: true }));
  }
};

/**
 * Simulates typing into an Angular Material time input field
 * @param timeInput - The HTML time input element
 * @param timeString - Time in format 'HH:MM' or 'HH:MM:SS'
 */
const simulateTimeInput = (timeInput: HTMLInputElement, timeString: string): void => {
  try {
    // First try the direct approach
    timeInput.value = timeString;

    // Create and dispatch input event
    const inputEvent = new Event('input', {
      bubbles: true,
      cancelable: true,
      composed: true
    });
    timeInput.dispatchEvent(inputEvent);

    // Create and dispatch change event
    const changeEvent = new Event('change', {
      bubbles: true,
      cancelable: true,
      composed: true
    });
    timeInput.dispatchEvent(changeEvent);

    // Try to trigger Angular's change detection
    const angularInput = timeInput as any;
    if (angularInput.ngModel) {
      // If it's an Angular form control
      const ctrl = angularInput.ngModel.control;
      if (ctrl) {
        ctrl.setValue(timeString);
        ctrl.updateValueAndValidity();
      }
    }

    // Also trigger on the form if it exists
    const form = timeInput.closest('form');
    if (form) {
      // Try to find Angular form
      const ngForm = (form as any).ngForm;
      if (ngForm && ngForm.control) {
        ngForm.control.updateValueAndValidity();
      }

      // Dispatch standard form events
      form.dispatchEvent(new Event('input', { bubbles: true }));
      form.dispatchEvent(new Event('change', { bubbles: true }));
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    }

    // If we have a ViewContainerRef, try to trigger change detection
    if ((window as any).ng) {
      try {
        const component = (window as any).ng.getComponent(timeInput);
        if (component && component.changeDetectorRef) {
          component.changeDetectorRef.detectChanges();
        }
      } catch (e) {
        console.log('Could not trigger Angular change detection');
      }
    }
  } catch (error) {
    console.error('Error in simulateTimeInput:', error);
    // Fallback to direct value assignment
    timeInput.value = timeString;
    timeInput.dispatchEvent(new Event('input', { bubbles: true }));
    timeInput.dispatchEvent(new Event('change', { bubbles: true }));
  }
};

type FillParams = {
  hours?: string;
  minutes?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
};

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
          simulateTimeInput(start, startTime);
        }
      }

      if (endTime) {
        const endInputs = document.querySelectorAll<HTMLInputElement>('input[id^="endtime-"]');
        for (const end of endInputs) {
          simulateTimeInput(end, endTime);
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
