Array.prototype.dl = function(filename = 'data.json', clearSet = true) {
  var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this));
  var downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", filename);
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
  if (clearSet) imageset = [];
}

Array.prototype.shuffle = function() {
  for (let i = this.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [this[i], this[j]] = [this[j], this[i]];
  }
  return this;
}

loadData = url => fetch(url).then(res => res.json());

function prepdata() {
  loadPixels();
  let pixelcopy = [];
  let check = 0;
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = pixels[i + 3];
    if (r + g + b < 6) check++;
    pixelcopy.push([r, g, b, a]);
  }
  if (check < 1) return false;
  let scaledpixels = []
  for (let y = 0; y < 280; y += 10) {
    for (let x = 0; x < 280; x += 10) {
      const sum = [0, 0, 0, 0];
      for (let yy = y; yy < y + 10; yy++) {
        for (let xx = x; xx < x + 10; xx++) {
          let index = xx + yy * 280;
          sum[0] += pixelcopy[index][0];
          sum[1] += pixelcopy[index][1];
          sum[2] += pixelcopy[index][2];
          sum[3] += 255;
        }
      }
      sum[0] /= 100;
      sum[1] /= 100;
      sum[2] /= 100;
      sum[3] /= 100;
      scaledpixels.push(sum)
    }
  }
  userinput = createImage(28, 28);
  userinput.loadPixels();
  for (let i = 0; i < scaledpixels.length; i++) {
    const r = scaledpixels[i][0];
    const g = scaledpixels[i][1];
    const b = scaledpixels[i][2];
    const a = scaledpixels[i][3];
    const col = color(r, g, b, a);
    const x = i % 28;
    const y = i / 28;
    userinput.set(x, y, col);
  }
  //userinput.updatePixels();
  const px = [];
  userinput.pixels.forEach(val => px.push(val));
  const grayscale = [];
  for (let i = 0; i < px.length; i += 4) {
    const r = px[i];
    const g = px[i + 2];
    const b = px[i + 2];
    grayscale.push(floor((r + g + b) / 3));
  }
  return normalize(grayscale);
}

function center(pixelArray) {
  const w = Math.floor(Math.sqrt(pixelArray.length));
  const pix = pixelArray;
  let top = Infinity;
  let bottom = -Infinity;
  let left = Infinity;
  let right = -Infinity;
  for (let i = 0; i < pix.length; i++) {
    const x = i % w;
    const y = Math.floor(i / w);
    if(pix[i] != 255) {
      if (top > y) top = y;
      if (bottom < y) bottom = y;
      if (right < x) right = x;
      if (left > x) left = x;
    }
  }
  bottom = w - bottom;
  right = w - right;
  const diff = {
    h: Math.floor((bottom - top) / 2),
    w: Math.floor((right - left) / 2)
  };
  const xyPix = pix.map((val, i) => {
    const p = {
      x: i % w,
      y: Math.floor(i / w),
      val: val
    }
    return p;
  });
  centeredXyPix = xyPix.map(val => {
    const temp = val;
    temp.x += diff.w;
    temp.y += diff.h;
    return temp;
  });
  let centered = [];
  for (let i = 0; i < centeredXyPix.length; i++) {
    const p = centeredXyPix[i];
    const index = p.x + w * p.y;
    if (index > 0 && index < (w*w)) centered[index] = p.val;
  }
  const first = centered.findIndex(val => val);
  if (first != 0) {
    for (let i = 0; i < first; i++) {
      centered[i] = 255;
    }
  }
  while(centered.length<(w*w)) centered.push(255);
  return centered;
}

function normalize(array) {
  const centered = center(array); // WORKS
  const [cropped, w] = cropDrawing(centered); // WORKS!
  const resized = resizeNN(cropped, w, w, 28, 28); // WORKS
  return resized;
}

function cropDrawing(pixelArray) {
  const box = getBoundingBox(pixelArray);
  const fullPictureWidth = Math.sqrt(pixelArray.length);
  const padding = 5;
  const xOffset = box.height > box.width ? padding + box.height - box.width : padding;
  const yOffset = box.width > box.height ? padding + box.width - box.height : padding;
  const cropped = [];
  let i = 0;
  console.log(box);
  console.log('xoff:'+ xOffset+' yoff:'+yOffset);
  for (let y = box.top - Math.floor(yOffset/2); y < box.top + box.height + Math.round(yOffset/2); y++) {
    for (let x = box.left - Math.floor(xOffset/2); x < box.left + box.width + Math.round(xOffset/2); x++) {
      const fullPictureIndex = x + y * fullPictureWidth;
      cropped[i] = pixelArray[fullPictureIndex];
      i++;
    }
  }
  const croppedDim = Math.sqrt(cropped.length);
  return [cropped, croppedDim];
}

function getBoundingBox(pixelArray) {
  const srcWidth = Math.sqrt(pixelArray.length);
  let l = Infinity;
  let r = -Infinity;
  let t = Infinity
  let b = -Infinity;
  for (let i = 0; i < pixelArray.length; i++) {
    if (pixelArray[i] != 255) {
      const x = i % srcWidth;
      const y = Math.floor(i / srcWidth);
      if (y < t) t = y;
      if (y > b) b = y;
      if (x < l) l = x;
      if (x > r) r = x;
    }
  }
  const w = r - l + 1;
  const h = b - t + 1;
  return {
    left: l,
    right: r,
    top: t,
    bottom: b,
    width: w,
    height: h
  }
}

function resizeNN(pixelArray, w1, h1, w2, h2) {
  const temp = [];
  const xRatio = w1 / w2;
  const yRatio = h1 / h2;
  let px, py;
  for (let i = 0; i < h2; i++) {
    for (let j = 0; j < w2; j++) {
      px = Math.floor(j * xRatio);
      py = Math.floor(i * yRatio);
      temp[(i * w2) + j] = pixelArray[(py * w1) + px];
    }
  }
  return temp;
}
