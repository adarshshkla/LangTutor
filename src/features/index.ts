/**
 * Clean Modular Feature Architecture
 * 
 * Each feature directory encapsulates its own UI components, logic, types, and state.
 * Teammates working on separate git branches can modify their assigned feature folder
 * (e.g. `src/features/pronunciation` or `src/features/curriculum`) independently
 * without causing merge conflicts across the codebase.
 */

export * from "./pronunciation";
export * from "./curriculum";
export * from "./conversation";
export * from "./smartboard";
export * from "./avatar";
export * from "./dashboard";
export * from "./auth";
export * from "./chapters";
