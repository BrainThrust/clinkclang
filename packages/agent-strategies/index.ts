import { ReActStrategy } from "./react";
import { ReflexionStrategy } from "./reflexion";
import { BaseStrategy } from "./base";

// a central export for all the frameworks
export { 
  BaseStrategy,
  ReActStrategy, 
  ReflexionStrategy
};

export type FrameworkName = "react" | "reflexion";