
export interface DisplayUnit {
  id: number;
  value: string; // Primary value
  secondaryValue: string; // Second value for alternating mode
  isAlternating: boolean; // Toggle for the mode
  isOn: boolean;
  color: string;
}

export interface SavedSet {
  id: string;
  name: string;
  timestamp: number;
  displays: DisplayUnit[];
}

export enum TabView {
  CONTROLLER = 'CONTROLLER',
  SAVED_SETS = 'SAVED_SETS',
  HARDWARE_GUIDE = 'HARDWARE_GUIDE',
  SETTINGS = 'SETTINGS'
}

export interface PinMapping {
  // Ordine dei segmenti nel bitstream (0-6 per ogni cifra)
  // Esempio: [0,1,2,3,4,5,6] significa A,B,C,D,E,F,G in ordine
  digit1: number[];
  digit2: number[];
}

export interface HardwareConfig {
  ipAddress: string;
  totalDisplays: number;
  pinMapping: PinMapping;
}