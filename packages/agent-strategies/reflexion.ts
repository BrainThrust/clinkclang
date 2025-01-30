import { z } from "zod";
import { BaseStrategy } from "packages/agent-strategies/base";

export class ReflexionStrategy extends BaseStrategy {
  public async execute(...args: any[]): Promise<any> {
    // do nothing for now, but will fill this up
    return;
  }
}