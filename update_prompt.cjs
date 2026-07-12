const fs = require('fs');

const promptText = `Analyze this reference sketch or 3D model. The user wants to generate a high-quality architectural rendering based ONLY on these structural lines. Their styling instruction is: "\\\${finalPrompt}". Please write an extremely vivid, purely descriptive image generation prompt.

CRITICAL RULES:
1. Describe the EXACT geometry, layout, and camera angle you see.
2. DO NOT invent or add architectural details like windows, doors, balconies, people, or trees unless they are clearly drawn in the reference!
3. If the reference is just abstract blocks or columns, explicitly state "abstract minimalist 3D blocks, massing model, no windows, no doors".
4. Apply the user's styling.
5. Output ONLY the raw visual description, no meta-text.`;

let code = fs.readFileSync('api/generate-image.ts', 'utf8');
const newPrompt = '`' + promptText.replace(/\n/g, '\\n') + '`';
code = code.replace(/const visionPrompt = `[^`]+`;/, 'const visionPrompt = ' + newPrompt + ';');
fs.writeFileSync('api/generate-image.ts', code);
