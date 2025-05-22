export type FillMessage = {
  action: string;
  hours?: string;
  minutes?: string;
  startTime?: string;
  endTime?: string;
};

export type FillResponse = Omit<FillMessage, 'action'>;

export type LocationMessage = {
  action: string;
  location?: string;
};

export type LocationResponse = Omit<LocationMessage, 'action'>;
