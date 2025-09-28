// Vue feature flags
globalThis.__VUE_OPTIONS_API__ = true;
globalThis.__VUE_PROD_DEVTOOLS__ = false;
globalThis.__VUE_PROD_HYDRATION_MISMATCH_DETAILS__ = false;

// Vue re-exports
export * from "vue/dist/vue.esm-bundler.js";
export * as v from "valibot";

// up-fetch re-exports
import { up, isValidationError, isResponseError, isJsonifiable } from "up-fetch";
export const upfetch = up(fetch);
export { up, isValidationError, isResponseError, isJsonifiable };

// Helpers
function debounce(fn, ms) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), ms);
    };
}

// API Plugin
export function createApiPlugin({ url, debounceMs = 300 } = {}) {
    const API_URL = url || "/api/v1/sql";

    return {
        install(app) {
            app.directive("api", {
                mounted(el, binding, vnode) {
                    const comp = vnode.ctx;

                    // Local reactive state for this directive instance
                    const local = app.reactive({
                        $api: null,
                        $loading: false,
                        $error: null,
                    });

                    async function runQuery(schema, vars = {}) {
                        try {
                            local.$loading = true;
                            local.$error = null;

                            const sql =
                                typeof schema.sql === "function"
                                    ? schema.sql(vars)
                                    : schema.sql;

                            const data = await upfetch(API_URL, {
                                method: "POST",
                                json: { sql: sql, params: vars },
                                schema, // validate with valibot
                            });

                            local.$api = data;
                        } catch (err) {
                            local.$error = err;
                            local.$api = null;
                        } finally {
                            local.$loading = false;
                        }
                    }

                    const debouncedRun = debounce(runQuery, debounceMs);

                    // Initial fetch
                    debouncedRun(
                        binding.value.schema || binding.value,
                        binding.value.vars || {}
                    );

                    // Re-run when vars change (reactive watch)
                    vnode.effect.run(() => {
                        debouncedRun(
                            binding.value.schema || binding.value,
                            binding.value.vars || {}
                        );
                    });

                    // Merge local state into component instance
                    Object.assign(comp.$data, local);
                },
            });
        },
    };
}
