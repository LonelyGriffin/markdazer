import {NativeEventEmitter, NativeModules} from 'react-native';

export type SoftwareKeyboardEvent =
  | {
      type: 'changed';
      text: string;
      cursor: number;
    }
  | {
      type: 'lineBreak';
      before: string;
      text: string;
      cursor: number;
    }
  | {
      type: 'backspaceOnTextBegin';
    };

export type SoftwareKeyboardAction =
  | {
      type: 'open';
    }
  | {
      type: 'change';
      text: string;
      cursor: number;
    };

type Subscriber = (event: SoftwareKeyboardEvent) => void;

export interface ISoftwareKeyboardService {
  subscribe(subscriber: Subscriber): () => void;
  dispatch(action: SoftwareKeyboardAction): void;
}

class SoftwareKeyboardService implements ISoftwareKeyboardService {
  private nativeModule: any;
  private subscribers: Subscriber[] = [];
  constructor() {
    this.nativeModule = NativeModules.SoftwareKeyboardService;
    const eventEmitter = new NativeEventEmitter(this.nativeModule);
    eventEmitter.addListener('EVENT', (event: SoftwareKeyboardEvent) => {
      this.subscribers.forEach((sb) => sb(event));
    });
  }
  subscribe(subscriber: Subscriber) {
    this.subscribers.push(subscriber);
    return () => {
      this.subscribers = this.subscribers.filter((sb) => sb !== subscriber);
    };
  }
  dispatch(action: SoftwareKeyboardAction) {
    NativeModules.SoftwareKeyboardService.dispatch(action);
  }
}

export class SoftwareKeyboardServiceMock implements ISoftwareKeyboardService {
  public subscribers: Subscriber[] = [];
  subscribe(subscriber: Subscriber) {
    this.subscribers.push(subscriber);
    return () => {
      this.subscribers = this.subscribers.filter((sb) => sb !== subscriber);
    };
  }
  dispatch(action: SoftwareKeyboardAction) {}
}

export default SoftwareKeyboardService;
