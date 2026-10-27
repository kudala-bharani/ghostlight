# Verification record

Build date: October 27, 2026. A new public repository has been created, but source upload and deployment are pending. No contest submission has been performed.

Deployment preparation: owner-approved MIT license, relative Vite base, and GitHub Pages Actions workflow were added. All 21 tests, JavaScript type checks and the production build passed again. The first connector file upload returned 403 (Resource not accessible by integration), and no files were uploaded.

## Passed

- 21 deterministic Node tests for validation, bounded input/output, prompt data quoting, output trimming, invalid/corrupt/unavailable storage, quota failure reporting, 30-entry bound and honest Markdown provenance.
- `npm run check`: TypeScript `checkJs: true` over application JavaScript.
- `npm run build`: production static bundle, including separately emitted inference worker/WASM.
- `npm audit`: zero reported vulnerabilities after updating Vite to 7.3.7 and overriding Node-only transitive `sharp` to 0.35.5. This is a package-advisory snapshot, not a complete security audit.
- Real CPU inference in Node using the open-weight Qwen2.5-0.5B-Instruct ONNX q8 model. Exact final output is in `real-inference-node.txt`. This is real model execution, **not browser execution**.
- Independent source review: output rendered as text, explicit sample provenance, request cancellation, generation-ID stale-result guard, native labeled controls, reduced-motion styling, transactional storage changes. These are source-level findings, not visual/interaction test passes.

## Not yet verified

- Real browser inference and model caching behavior.
- Desktop/mobile visual rendering, keyboard flows and exact text contrast.
- Cancel/retry under actual browser network/CPU load.
- Download/export and reload-persistence browser interactions.
- A deployed production URL or GitHub Pages subpath behavior.

The local Vite process starts in the execution sandbox but is not reachable from separate tool calls/cloud browser (connection refused). Direct Chromium launch fails under sandbox socket restrictions; an approved escalation attempt failed at runtime mount setup. No restricted filesystem/network workaround was used. The supported cloud browser also cannot reach the isolated local server. Run browser checks on an approved deployment or an accessible local computer before calling the project publicly verified.

## Browser acceptance checklist

1. At 1440px and 390px widths, verify no overflow and all controls are readable and keyboard accessible.
2. Read the preset sample, save once, reload, open it, export it, cancel removal via Escape, then confirm removal.
3. Generate with real model, verify the local-model label and nonempty story. Confirm only model files/configs are requested, not prompt text.
4. Cancel during first download, retry; cancel during generation, retry; no stale result or duplicate save.
5. Simulate storage denial/quota. Save/remove failures must preserve prior state and not claim persisted success.
6. Simulate model network failure. Explicit error, no fake generated story; preset remains separately labeled.
7. Test malformed stored JSON and oversized/invalid entries.
8. Confirm at most 30 saved entries; input/output are text even when containing HTML-like strings.

## Known product tradeoffs

Small CPU inference prioritizes no API keys and approachable devices over literary consistency. The model can ignore constraints or repeat itself. Output is capped at 220 tokens and only its incomplete final sentence is removed. No alternate model secretly rewrites the result. First download is approximately 550 MB; available memory and CPU speed matter. Five-minute timeout and stop button are provided. Local storage is not encrypted, browser cache can be evicted, and offline app-shell loading is not promised.
