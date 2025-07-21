export const StateStatus = {
  IDLE: 'IDLE',
  LOADING: 'LOADING',
  SUCCEEDED: 'SUCCEEDED',
  FAILED: 'FAILED',
} as const;

export type StateStatusEnum = keyof typeof StateStatus;
export type StateStatusValue = (typeof StateStatus)[keyof typeof StateStatus];
