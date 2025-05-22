import { useState } from 'react';
import './App.css';
import TextField from '../components/TextField';
import { FillMessage, FillResponse, LocationMessage, LocationResponse } from '../lib/types';

const getTab = () => {
  return chrome.tabs.query({ active: true, currentWindow: true });
};

function App() {
  const [formData, setFormData] = useState({
    hours: '05',
    minutes: '00',
    startTime: '08:00',
    endTime: '13:00',
    location: 'Home'
  });
  const onSubmit = async () => {
    const [tab] = await getTab();
    if (tab?.id) {
      chrome.tabs.sendMessage<FillMessage, FillResponse>(
        tab.id,
        {
          action: 'fill',
          hours: formData.hours,
          minutes: formData.minutes,
          startTime: formData.startTime,
          endTime: formData.endTime
        },
        response => {
          console.log('fill response', response);
        }
      );
    }
  };

  const onLocation = async (type: 'start' | 'end') => {
    const [tab] = await getTab();
    if (tab?.id) {
      chrome.tabs.sendMessage<LocationMessage, LocationResponse>(
        tab.id,
        {
          action: type === 'start' ? 'startLocation' : 'endLocation',
          location: formData.location
        },
        response => {
          console.log('location response', response);
        }
      );
    }
  };
  return (
    <>
      <div className="card">
        <div style={{ flexDirection: 'column', display: 'flex' }}>
          <label>Hours</label>
          <TextField
            defaultValue={'05'}
            value={formData.hours}
            onChange={event => {
              setFormData({ ...formData, hours: event.target.value });
            }}
          />
          <label>Minutes</label>
          <TextField
            defaultValue={'00'}
            value={formData.minutes}
            onChange={event => {
              setFormData({ ...formData, minutes: event.target.value });
            }}
          />
          <label>Start Time</label>
          <TextField
            defaultValue={'08:00 AM'}
            value={formData.startTime}
            onChange={event => {
              setFormData({ ...formData, startTime: event.target.value });
            }}
          />
          <label>End Time</label>
          <TextField
            defaultValue={'01:00 PM'}
            value={formData.endTime}
            onChange={event => {
              setFormData({ ...formData, endTime: event.target.value });
            }}
          />
          <label>Location</label>
          <TextField
            defaultValue={'Home'}
            value={formData.location}
            onChange={event => {
              setFormData({ ...formData, location: event.target.value });
            }}
          />
          <button onClick={onSubmit}>Submit</button>
          <button onClick={() => onLocation('start')}>Start Location</button>
          <button onClick={() => onLocation('end')}>End Location</button>
        </div>
      </div>
    </>
  );
}

export default App;
