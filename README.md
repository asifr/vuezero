# vuezero

This bundles Vue 3 with Valibot and up-fetch as a single ESM file for use in the browser. This is useful for quickly prototyping Vue apps without a build step.

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

## Query Plugin

The `createQueryPlugin` provides a `v-query` directive for making reactive SQL queries to your backend. Each directive creates isolated reactive state with `$loading`, `$error`, and `$data` properties.

Valibot is used for schema validation of query response so you can be sure the SQL response matches your expectations.

### Basic Usage

```js
import { createQueryPlugin } from './dist/vuezero.esm.js';

app.use(createQueryPlugin({
    url: '/api/v1/sql',  // Your SQL API endpoint
    debounceMs: 500      // Debounce requests by 500ms
}));
```

The API endpoint should accept POST requests with JSON body:
```json
{
    "sql": "SELECT * FROM users WHERE id = ?",
    "params": { "id": 1 }
}
```

The response should be JSON data that matches the provided Valibot schema.

### Examples

**Static SQL Query:**
```html
<div v-query="usersQuery">
    <div v-if="$loading">Loading users...</div>
    <div v-if="$error">Error: <span v-text="$error.message"></span></div>
    <div v-if="$data">
        <pre v-text="JSON.stringify($data, null, 2)"></pre>
    </div>
</div>
```

```js
const usersQuery = {
    schema: v.array(v.object({
        id: v.number(),
        name: v.string(),
        email: v.string()
    })),
    sql: "SELECT id, name, email FROM users LIMIT 10"
};
```

**Dynamic Query with Variables:**

A real-world example where user inputs are used to parameterize the SQL query.

```html
<div>
    <input v-model.number="userId" type="number" placeholder="User ID">
    <input v-model.number="minAge" type="number" placeholder="Min Age">
</div>

<div v-query="userQuery">
    <div v-if="$loading">Loading...</div>
    <div v-if="$error">Error: <span v-text="$error.message"></span></div>
    <div v-if="$data">
        <pre v-text="JSON.stringify($data, null, 2)"></pre>
    </div>
</div>
```

```js
const userQuery = computed(() => ({
    schema: v.array(v.object({
        id: v.number(),
        name: v.string(),
        age: v.number()
    })),
    sql: "SELECT * FROM users WHERE id = ? AND age >= ?",
    params: { userId: userId.value, minAge: minAge.value }
}));
```

**Function-based SQL:**
```js
const searchQuery = computed(() => ({
    schema: v.array(v.object({
        id: v.number(),
        name: v.string()
    })),
    sql: (params) => `SELECT * FROM users WHERE name ILIKE '%${params.term}%'`,
    params: { term: searchTerm.value }
}));
```

**Parameters:**
The `params` property can be either an object (dict) or an array (list):
```js
// Object/dict - for named parameters
params: { userId: 1, minAge: 18 }

// Array/list - for positional parameters
params: [1, 18]
```

### API Endpoint

The plugin expects your API endpoint to:
- Accept POST requests
- Receive JSON: `{ sql: string, params: object | array }`
- Return data that validates against the provided Valibot schema

### Reactive State

Each `v-query` directive provides isolated reactive state:
- **$loading**: Boolean indicating if query is in progress
- **$error**: Error object if query failed, null otherwise
- **$data**: Validated response data, null if no data or error

These variables are only accessible within the scope of each `v-query` directive.

## Building for distribution

Install dependencies:

```bash
bun install
```

Build the ESM bundle:

```bash
source ./build.sh
```

This will create `dist/vuezero.esm.js` which you can include in your HTML.