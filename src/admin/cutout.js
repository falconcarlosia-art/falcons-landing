// Recorte de fondo en el navegador, sin API de pago.
//
// Modelo: BiRefNet lite (licencia MIT) vía Transformers.js (Apache-2.0).
// - Con WebGPU capaz: versión 1024 px en fp16 (~115 MB), mejor en bordes finos.
// - Sin ella (p. ej. GPU Intel integrada): versión 512 px en WASM (~190 MB);
//   la de 1024 px se queda sin memoria en WASM ("std::bad_alloc").
// Se descarga una sola vez y el navegador la guarda en caché.
// Nota: NO usar @imgly/background-removal (AGPL) ni RMBG de Bria (no comercial).
const MODELS = {
  webgpu: { id: "onnx-community/BiRefNet_lite-ONNX", dtype: "fp16" },
  wasm: { id: "studioludens/birefnet-lite-512", dtype: "fp32" },
};

// Lienzo final: cuadrado, producto centrado, margen pequeño (el sitio ya
// agrega su propio padding al mostrarlo).
const MAX_SIDE = 1200;
const MARGIN = 0.04;
const ALPHA_CUTOFF = 24; // píxeles casi transparentes no cuentan para el contorno

const segmenters = new Map(); // device -> Promise<pipeline>

// BiRefNet en WebGPU necesita más de 16 storage buffers por shader; con
// menos falla ("Too many storage buffers"). ONNX Runtime no puede cambiar a
// WASM en la misma página una vez iniciado WebGPU, así que se decide antes
// y, si igual falla, se recuerda para la próxima carga.
const DEVICE_KEY = "falcons-cutout-device";
const MIN_STORAGE_BUFFERS = 24;

function rememberedDevice() {
  try {
    return localStorage.getItem(DEVICE_KEY);
  } catch {
    return null;
  }
}

async function pickDevice() {
  if (rememberedDevice() === "wasm") return "wasm";
  try {
    const adapter = await navigator.gpu?.requestAdapter();
    if (adapter && adapter.limits.maxStorageBuffersPerShaderStage >= MIN_STORAGE_BUFFERS) return "webgpu";
  } catch {
    /* sin WebGPU */
  }
  return "wasm";
}

// onProgress(fraccion 0..1 | null) mientras descarga el modelo.
function loadSegmenter(device, onProgress) {
  if (!segmenters.has(device)) {
    const files = new Map();
    const promise = import("@huggingface/transformers")
      .then(({ pipeline }) =>
        pipeline("background-removal", MODELS[device].id, {
          device,
          dtype: MODELS[device].dtype,
          progress_callback: (e) => {
            if (e.status !== "progress" || !e.total) return;
            files.set(e.file, { loaded: e.loaded, total: e.total });
            let loaded = 0;
            let total = 0;
            for (const f of files.values()) {
              loaded += f.loaded;
              total += f.total;
            }
            onProgress?.(total ? loaded / total : null);
          },
        })
      )
      .catch((err) => {
        segmenters.delete(device);
        throw err;
      });
    segmenters.set(device, promise);
  }
  return segmenters.get(device);
}

let devicePromise = null;

async function segment(src, onStage) {
  devicePromise ??= pickDevice();
  const device = await devicePromise;
  try {
    onStage?.("modelo", null);
    const segmenter = await loadSegmenter(device, (p) => onStage?.("modelo", p));
    onStage?.("procesando", null);
    return await segmenter(src);
  } catch (err) {
    if (device !== "webgpu") throw err;
    console.warn("Recorte con WebGPU falló:", err);
    try {
      localStorage.setItem(DEVICE_KEY, "wasm");
    } catch {
      /* sin almacenamiento */
    }
    throw new Error(
      "Tu tarjeta gráfica no pudo hacer el recorte acelerado. Recarga la página y vuelve a intentarlo: usará el modo estándar (más lento)."
    );
  }
}

function tightBox(ctx, w, h) {
  const { data } = ctx.getImageData(0, 0, w, h);
  let minX = w, minY = h, maxX = -1, maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] > ALPHA_CUTOFF) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) return null;
  return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
}

const toBlob = (canvas, type, quality) =>
  new Promise((resolve) => canvas.toBlob(resolve, type, quality));

/**
 * Quita el fondo de una imagen (URL pública, blob: o data:) y devuelve un
 * WebP cuadrado con fondo transparente (PNG si el navegador no codifica WebP).
 * onStage("modelo" | "procesando", progreso)
 */
export async function removeBackground(src, onStage) {
  const result = await segment(src, onStage);
  const source = result.toCanvas();
  const sctx = source.getContext("2d");
  const box = tightBox(sctx, source.width, source.height);
  if (!box) throw new Error("No se detectó ningún producto en la imagen.");

  const side = Math.min(MAX_SIDE, Math.round(Math.max(box.w, box.h) / (1 - 2 * MARGIN)));
  const scale = (side * (1 - 2 * MARGIN)) / Math.max(box.w, box.h);
  const dw = Math.round(box.w * scale);
  const dh = Math.round(box.h * scale);

  const out = document.createElement("canvas");
  out.width = side;
  out.height = side;
  const octx = out.getContext("2d");
  octx.imageSmoothingQuality = "high";
  octx.drawImage(source, box.x, box.y, box.w, box.h, (side - dw) / 2, (side - dh) / 2, dw, dh);

  const webp = await toBlob(out, "image/webp", 0.9);
  if (webp?.type === "image/webp") return webp;
  return toBlob(out, "image/png");
}
