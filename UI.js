let helpOpen = false;

function toggleHelp() {
  if (infoOpen) toggleInfo();
  if (helpOpen) {
    document.querySelector('#helpOverlay').style.display = 'none';
    document.querySelector('.fa-question-circle').style.color = 'rgba(0,0,0,1)';
    helpOpen = false;
  } else {
    document.querySelector('#helpOverlay').style.display = 'block';
    document.querySelector('.fa-question-circle').style.color = 'rgba(0,0,0,0.5)';
    helpOpen = true;
  }
}

let infoOpen = false;

function toggleInfo() {
  if (helpOpen) toggleHelp();
  if (infoOpen) {
    document.querySelector('#infoOverlay').style.display = 'none';
    document.querySelector('.fa-info-circle').style.color = 'rgba(0,0,0,1)';
    infoOpen = false;
  } else {
    document.querySelector('#infoOverlay').style.display = 'block';
    document.querySelector('.fa-info-circle').style.color = 'rgba(0,0,0,0.5)';
    infoOpen = true;
  }
}

function mouseDragged() {
  if (eraserOn) {
    for (let pt of numberPoints) {
      const distance = dist(mouseX, mouseY, pt.x, pt.y);
      if (distance < 30) {
        numberPoints.splice(numberPoints.indexOf(pt), 1);
      }
    }
  } else {
    numberPoints.push({
      x: mouseX,
      y: mouseY
    })
  }
  debounceGuess();
}

debounceGuess = debounce(() => {
  if (numberPoints.length > 0) guess()
}, 20);

function debounce(func, wait, immediate) {
  let timeout;
  return function() {
    let context = this,
      args = arguments;
    let later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    let callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

function mouseReleased() {
  if (numberPoints.length > 1) guess();
}

function drawPoints() {
  push();
  for (let pt of numberPoints) {
    strokeWeight(30);
    stroke(0);
    point(pt.x, pt.y);
  }
  pop();
}

function clearCanvas() {
  numberPoints = [];
  for (let i = 0; i < 10; i++) {
    const elm = document.querySelector(`#confbar${i}`);
    elm.style.height = 17 + '%';
  }
}

function drawEraseArea() {
  push();
  noFill();
  stroke(0);
  strokeWeight(1);
  ellipse(mouseX, mouseY, 30);
  pop()
}

function toggleEraser() {
  const p = document.querySelector('.fa-pen')
  const e = document.querySelector('.fa-eraser')
  if (eraserOn) {
    eraserOn = false;
    e.style.opacity = 0.5;
    p.style.opacity = 1;
  } else {
    eraserOn = true;
    e.style.opacity = 1;
    p.style.opacity = 0.5;
  }
}
