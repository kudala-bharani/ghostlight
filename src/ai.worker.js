import { pipeline, env } from "@huggingface/transformers";
import { MODEL, makeMessages, normalizeStory } from "./core.js";
env.allowLocalModels = false;
env.backends.onnx.wasm.numThreads = 1;
let generator;
self.onmessage = async ({ data }) => {
  if (data.type !== "generate") return;
  try {
    if (!generator) {
      self.postMessage({
        type: "status",
        text: "Downloading the open model. First visit may take a few minutes.",
      });
      generator = await pipeline("text-generation", MODEL, {
        dtype: "q8",
        device: "wasm",
        progress_callback: (p) => {
          if (p.status === "progress")
            self.postMessage({
              type: "progress",
              file: p.file,
              progress: p.progress,
              loaded: p.loaded,
              total: p.total,
            });
        },
      });
    }
    self.postMessage({
      type: "status",
      text: "The object is remembering… Writing locally on your device.",
    });
    const result = await generator(makeMessages(data.input), {
      max_new_tokens: 220,
      do_sample: false,
      repetition_penalty: 1.13,
      return_full_text: false,
    });
    let value = result[0].generated_text;
    if (Array.isArray(value)) value = value[value.length - 1]?.content;
    self.postMessage({ type: "complete", story: normalizeStory(value) });
  } catch (error) {
    generator = null;
    self.postMessage({
      type: "error",
      text: error instanceof Error ? error.message : String(error),
    });
  }
};
