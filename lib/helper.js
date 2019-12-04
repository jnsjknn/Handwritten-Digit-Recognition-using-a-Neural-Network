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
  return center(grayscale);
}

function center(pixelArray) {
  const pix = pixelArray;
  let top = Infinity;
  let bottom = -Infinity;
  let left = Infinity;
  let right = -Infinity;
  for (let i = 0; i < pix.length; i++) {
    const x = i % 28;
    const y = Math.floor(i / 28);
    if (pix[i] != 255 && top > y) top = y;
    if (pix[i] != 255 && bottom < y) bottom = y;
    if (pix[i] != 255 && right < x) right = x;
    if (pix[i] != 255 && left > x) left = x;
  }
  bottom = 28 - bottom;
  right = 28 - right;
  const diff = {
    h: Math.floor((bottom - top) / 2),
    w: Math.floor((right - left) / 2)
  };
  const xyPix = pix.map((val, i) => {
    const p = {
      x: i % 28,
      y: Math.floor(i / 28),
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
    const index = p.x + 28 * p.y;
    if (index > 0 && index < 784) centered[index] = p.val;
  }
  const first = centered.findIndex(val => val);
  if (first != 0) {
    for (let i = 0; i < first; i++) {
      centered[i] = 255;
    }
  }
  while(centered.length<784) centered.push(255);
  return centered;
}
