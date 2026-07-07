import { fal } from '@fal-ai/client';

async function test() {
  console.log("Testing fal-ai/aura-sr upscaler");
  try {
    const result = await fal.subscribe("fal-ai/aura-sr", {
      input: {
        image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/A_black_square.jpg/120px-A_black_square.jpg"
      }
    });
    console.log("Success aura-sr:", result);
  } catch(e) {
    console.error("aura-sr failed:", e.message);
  }

  console.log("Testing fal-ai/ccsr upscaler");
  try {
    const result = await fal.subscribe("fal-ai/ccsr", {
      input: {
        image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/A_black_square.jpg/120px-A_black_square.jpg"
      }
    });
    console.log("Success ccsr:", result);
  } catch(e) {
    console.error("ccsr failed:", e.message);
  }
}
test();
