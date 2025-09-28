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

// Query Plugin
export function createQueryPlugin({ url, debounceMs = 300 } = {}) {
    const API_URL = url || "/api/v1/sql";

    return {
        install(app) {
            app.directive("query", {
                mounted(el, binding, vnode) {
                    const comp = vnode.ctx;

                    // Local reactive state for this directive instance
                    const local = app.reactive({
                        $data: null,
                        $loading: false,
                        $error: null,
                    });

                    async function runQuery(schema, params = {}) {
                        try {
                            local.$loading = true;
                            local.$error = null;

                            const sql =
                                typeof schema.sql === "function"
                                    ? schema.sql(params)
                                    : schema.sql;

                            const data = await upfetch(API_URL, {
                                method: "POST",
                                json: { sql: sql, params: params },
                                schema, // validate with valibot
                            });

                            local.$data = data;
                        } catch (err) {
                            local.$error = err;
                            local.$data = null;
                        } finally {
                            local.$loading = false;
                        }
                    }

                    const debouncedRun = debounce(runQuery, debounceMs);

                    // Initial fetch
                    debouncedRun(
                        binding.value.schema || binding.value,
                        binding.value.params || {}
                    );

                    // Re-run when params change (reactive watch)
                    vnode.effect.run(() => {
                        debouncedRun(
                            binding.value.schema || binding.value,
                            binding.value.params || {}
                        );
                    });

                    // Merge local state into component instance
                    Object.assign(comp.$data, local);
                },
            });
        },
    };
}
