import { FillMessage, FillResponse, LocationMessage, LocationResponse } from './lib/types';

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
          hour.value = hours;
        }
      }

      if (minutes) {
        const minuteInputs = document.querySelectorAll<HTMLInputElement>('input[id^="minutes-"]');
        for (const minute of minuteInputs) {
          minute.value = minutes;
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
