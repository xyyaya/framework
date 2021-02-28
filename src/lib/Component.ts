import {FrameworkErrorCode} from '../ErrorCode';
import {FrameworkError} from './FrameworkError';
import {Logger} from './logger/Logger';
import {Runtime} from './Runtime';

export interface IComponentOptions {}

abstract class Component {
  constructor(name: string) {
    this.name_ = name;
    this.init_ = false;
    this.ref_ = 0;
    Runtime.registerComponent(this.name_, this);
  }

  setOptions(options: IComponentOptions) {
    this.options_ = options;
  }

  protected abstract connect(): Promise<void>;
  async start() {
    if (!this.options_)
      throw new FrameworkError(FrameworkErrorCode.ERR_COMPONENT_OPTIONS_NOT_SET, `ERR_COMPONENT_OPTIONS_NOT_SET, name=${this.name_}`);

    this.ref_ ++;
    if (this.ref_ > 1)
      return;

    await this.connect().catch(err => {
      Runtime.frameLogger.error(`component.${this.name_}`, err, { event: 'connect-component', error: Logger.errorMessage(err) });
    });
    this.init_ = true;
  }

  protected abstract disconnect(): Promise<void>;
  async stop() {
    this.ref_ --;
    if (!this.ref_)
      await this.disconnect();
  }

  get ready() {
    return this.init_;
  }

  protected name_: string;
  protected options_: IComponentOptions;
  private init_: boolean;
  private ref_: number;
}

export {Component};
