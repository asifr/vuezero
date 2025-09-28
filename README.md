# vuezero

This bundles Vue 3 with Valibot and up-fetch as a single ESM file for use in the browser. This is useful for quickly prototyping Vue apps without a build step.

To install dependencies:

```bash
bun install
```

To build:

```bash
source ./build.sh
```

Example:

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>

<body>
    <div id="app">
        <div>
            <p>Count: <span v-text="count"></span></p>
            <button v-on:click="count++">Increment</button>
            <button v-on:click="count--">Decrement</button>
            <button v-on:click="validate">Validate</button>
        </div>
    </div>
    <script type="module">
        // Vue, Valibot and up-fetch bundled in a single file
        import { createApp, ref, v } from './dist/vuezero.esm.js';

        const app = createApp({
            setup() {
                const count = ref(0);
                const schema = v.object({
                    author: v.string(),
                    books: v.pipe(v.number(), v.minValue(0, "Can't be less than 0 books"), v.maxValue(5, "Can't be more than 5 books"))
                });

                const validate = () => {
                    try {
                        const result = v.parse(schema, { author: "Martha Wells", books: count.value });
                        console.log("Valid:", result);
                    } catch (e) {
                        console.error("Validation Error:", e.issues);
                    }
                };

                return { count, validate };
            }
        });

        app.mount('#app');
    </script>
</body>

</html>
```