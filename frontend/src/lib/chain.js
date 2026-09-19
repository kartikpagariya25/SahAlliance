import { mockChain } from "./mock.js";
import { liveChain } from "./liveChain.js";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export const chain = USE_MOCK ? mockChain : liveChain;
export { USE_MOCK };
