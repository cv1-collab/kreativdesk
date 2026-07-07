import { fal } from '@fal-ai/client';

async function test() {
  console.log("Testing fal-ai/flux-general controlnet");
  try {
    const result = await fal.subscribe("fal-ai/flux-general", {
      input: {
        prompt: "A beautiful building",
        controlnets: [
          {
            path: "https://huggingface.co/XLabs-AI/flux-controlnet-canny-v3/resolve/main/flux-canny-controlnet-v3.safetensors",
            image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/A_black_square.jpg/120px-A_black_square.jpg",
            variant: "canny"
          }
        ]
      }
    });
    console.log("Success with flux-general ControlNet");
  } catch(e) {
    console.error("flux-general ControlNet failed:", e.message);
  }
}
test();
