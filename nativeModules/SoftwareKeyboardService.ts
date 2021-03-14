import {NativeEventEmitter, NativeModules} from 'react-native';

export type SoftwareKeyboardEvent = {
  type: 'changed';
  text: string;
  cursor: number;
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

class SoftwareKeyboardService {
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
    console.log(NativeModules);
    NativeModules.SoftwareKeyboardService.dispatch(action);
  }
}

export default new SoftwareKeyboardService();
