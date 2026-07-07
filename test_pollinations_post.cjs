const fs = require("fs");
const https = require("https");

async function run() {
  const imageBase64 = fs.readFileSync("test_img2img.jpg").toString("base64");
  const data = JSON.stringify({
    prompt: "A beautiful house",
    image: "data:image/jpeg;base64," + imageBase64
  });

  const options = {
    hostname: 'image.pollinations.ai',
    port: 443,
    path: '/',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = https.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    let imgData = [];
    res.on('data', (chunk) => imgData.push(chunk));
    res.on('end', () => {
      fs.writeFileSync("test_post_image.jpg", Buffer.concat(imgData));
      console.log("Saved to test_post_image.jpg");
    });
  });

  req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
  });

  req.write(data);
  req.end();
}

run();
