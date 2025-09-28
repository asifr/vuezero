// Define Vue feature flags
globalThis.__VUE_OPTIONS_API__ = true;
globalThis.__VUE_PROD_DEVTOOLS__ = false;
globalThis.__VUE_PROD_HYDRATION_MISMATCH_DETAILS__ = false;

export * from "vue/dist/vue.esm-bundler.js";
export * as v from "valibot";
import { up, isValidationError, isResponseError, isJsonifiable } from 'up-fetch';
export const upfetch = up(fetch);
export { up, isValidationError, isResponseError, isJsonifiable };