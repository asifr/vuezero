bun build index.js --outfile dist/vuezero.esm.js --minify --target browser --format esm
gzip -c dist/vuezero.esm.js > dist/vuezero.esm.js.gz