const fs = require('fs');
let code = fs.readFileSync('api/generate-image.ts', 'utf8');
const newPrompt = "`Analyze this reference sketch or 3D model. The user wants to generate a high-quality architectural rendering based ONLY on these structural lines. Their styling instruction is: \\"${finalPrompt}\\". Please write an extremely vivid, purely descriptive image generation prompt.\\n\\nCRITICAL RULES:\\n1. Describe the EXACT geometry, layout, and camera angle you see.\\n2. DO NOT invent or add architectural details like windows, doors, balconies, people, or trees unless they are clearly drawn in the reference!\\n3. If the reference is just abstract blocks or columns, explicitly state \\"abstract minimalist 3D blocks, massing model, no windows, no doors\\".\\n4. Apply the user's styling.\\n5. Output ONLY the raw visual description, no meta-text.`";
code = code.replace(/const visionPrompt = `[^`]+`;/, `const visionPrompt = ${newPrompt};`);
fs.writeFileSync('api/generate-image.ts', code);
