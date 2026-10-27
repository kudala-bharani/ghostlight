# Ghostlight

**Some things still have a story.** Ghostlight is a browser-local cabinet of fictional haunted objects, made for Hacktoberfest 2026 Week 4, _Ghost in the Machine_.

Name an ordinary object, choose its setting and feeling, and an open-weight language model gives it an imagined afterlife. Keep stories in your browser or export them as Markdown. No login, API keys, paid inference or backend.

## Run locally

Requires Node 20.19+ or 22.12+.

```sh
npm ci
npm run dev
```

Open the URL Vite prints. If your environment restricts network-interface discovery, use `npx vite --host 127.0.0.1 --port 4173`.

```sh
npm test          # deterministic core tests
npm run check    # TypeScript checkJs over JavaScript sources
npm run build    # static production bundle
npm run preview  # inspect production build
```

## The open AI, not a disguised API

The real generation path runs **onnx-community/Qwen2.5-0.5B-Instruct**, quantized to 8-bit ONNX, through **Transformers.js 3.8.1** and ONNX Runtime Web. The model runs in a dedicated browser worker with CPU/WebAssembly execution, not a hosted inference endpoint. No WebGPU requirement. Input and generated text stay in the browser; the app sends neither to an inference service.

- Original model: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct (Apache 2.0)
- ONNX weights: https://huggingface.co/onnx-community/Qwen2.5-0.5B-Instruct/tree/main/onnx
- Runtime: https://github.com/huggingface/transformers.js (Apache 2.0)
- Runtime dependency: ONNX Runtime (MIT)

The first generation downloads roughly **550 MB**: a 512 MB quantized model plus tokenizer/configuration and WASM runtime. First use needs internet; downloads go to Hugging Face/CDN and therefore expose ordinary network metadata such as IP address to those hosts. Google Fonts also supplies the typography; system fonts are fallbacks. The app does not guarantee offline availability: model caching is browser-controlled, the app shell has no service worker, and caches may be evicted.

A small CPU model is intentionally accessible but imperfect. Stories can repeat, ignore details, or end awkwardly. Generation is bounded to 220 tokens; a trailing incomplete sentence is dropped rather than invented or completed by a different system. The result is a story fragment, not a guaranteed complete narrative. They are fiction, not reliable historical accounts. Allow a few minutes on a capable desktop; phones or memory-constrained devices may fail or be slow. The app stops any request after five minutes and supports explicit cancellation by terminating the worker. Cancellation can mean reloading the model next time.

The **included sample is explicitly labeled and separate**. It never pretends to be inference, never silently replaces failed model output, and never downloads weights.

## Privacy and safety

- No account, analytics, payment integration or server-side story store.
- `localStorage` holds up to 30 saved stories in this browser. It is not encrypted. Anyone with access to this browser profile may read them. Clearing site data deletes them; export copies first.
- Object names are limited to 80 characters and encoded as quoted data. Model prompts request gentle fictional ghosts, not real-person imitation. This is a prompt-level guardrail, not a guarantee or moderation system.
- Model output and saved text use DOM `textContent`, never HTML execution. Do not enter private information. Review generated fiction before sharing.
- The read-only model downloads require no tokens or account credentials.

## Design

An airy midnight-green museum desk, a CSS-drawn illuminated bell jar, warm paper stories, and a private collection below. The illustration is original CSS, not a stock asset. Responsive layouts, semantic controls, live status, reduced motion and keyboard focus states are included.

## Structure

- `src/core.js`: input validation, prompt, storage validation and Markdown export
- `src/ai.worker.js`: real local model loading and inference
- `src/main.js`: accessible UI, worker lifecycle and cabinet interactions
- `src/style.css`: responsive visual system and original illustration
- `tests/core.test.js`: deterministic tests
- `tests/inference-node.mjs`: optional real CPU inference smoke test (downloads weights)
- `tests/inference-browser.mjs`: optional Chromium inference smoke test (downloads weights)
- `docs/VERIFICATION.md`: what was actually checked and what remains
- `docs/CHALLENGE.md`: requirements and evidence checklist, not a submitted entry

## Deployment

`npm run build` creates `dist/`, suitable for a static host with HTTPS. Vite uses relative asset paths so the app works at a GitHub Pages repository subpath.

The included `.github/workflows/pages.yml` installs dependencies, runs tests/type checks, builds, and deploys `dist/` to GitHub Pages. In repository Settings → Pages, set Source to GitHub Actions. Then push the source to `main` or run the workflow manually. This uses GitHub Pages for a public repository, with no paid API.

Repository: https://github.com/kudala-bharani/ghostlight . Creation is verified; source upload and deployment are still pending. Do not treat a repository URL as evidence the app is live. No DEV contest submission has been performed.

## AI assistance and license

This project was developed with an AI coding assistant. The included sample story was written during that assisted build, not by the on-device model. All claims of on-device results should be tied to actual verification, not the sample.

The application code is licensed under the MIT License (see `LICENSE`), approved by the owner. The model and dependencies retain their respective licenses; the app's MIT license does not relicense those third-party assets.
