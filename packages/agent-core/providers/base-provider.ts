import { Message, ModelConfig, ModelResponse } from '../schema/base';

// abstract base class that defines every what each (model) provider should implement
export abstract class Base {
    config: ModelConfig

    constructor (config: ModelConfig) {
        this.config = config
    }

    abstract generateResponse(messages: Message[]): Promise<ModelResponse>;
}