function mouseDragged() {
  if(!scrollingAllowed) {
    if (eraser) {
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
  } else {
    if(mouseX<width && mouseX > 0 && mouseY < height && mouseY > 0) {
      setError('Disable scrolling first!', 1000);
    }
  }

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
function toggleScrolling() {
  const html = document.querySelector('html');
  const body = document.querySelector('body');
  const scrollingButton = document.querySelector('#scrolling');
  if (!scrollingAllowed) {
    scrollingButton.style.color = 'rgba(0,0,0,1)';
    html.style.overflow = 'visible';
    body.style.overflow = 'visible';
    body.style.position = 'static';
    scrollingAllowed = true;
  } else {
    scrollingButton.style.color = 'rgba(0,0,0,0.4)';
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    body.style.position = 'fixed';
    scrollingAllowed = false;
  }
}

function setError(message, time) {
  error = message;
  setTimeout(() => error = false, time);
}

function viewData() {
  const test = confirm("Do you really want to leave this page? If you drew some numbers and didn't upload them, they will be lost!")
  if (test) {
    window.location.href = 'dataset.html'
  }
}

function getUsername() {
  if (imageset.length > 0) {
    const button = document.querySelector('#upload');
    const parent = document.querySelector('#datageneration');
    parent.removeChild(button);
    const info = document.createElement("p");
    info.innerHTML = '<br>If you want your name or username listed in the contributors of the dataset, enter it below. Otherwise, leave the field empty.'
    const nameinp = document.createElement("input");
    nameinp.style.marginTop = '5px'
    nameinp.setAttribute('placeholder', 'Type your name');
    nameinp.style.height = '35px';
    nameinp.style.padding = '1px 5px';
    nameinp.style.textAlign = 'center';
    nameinp.id = 'nameinp'
    const oldHeight = window.innerHeight;
    nameinp.addEventListener('focus', () => {
      setTimeout(() => {
        const newHeight = window.innerHeight;
        if (oldHeight > newHeight && window.innerWidth < 768) {
          let bottom = nameinp.getBoundingClientRect().bottom;
          let amt = 2;
          while(bottom + 2 > newHeight) {
            bottom = nameinp.getBoundingClientRect().bottom;
            nameinp.style.transform = `translate(0px, ${-amt}px)`;
            amt++;
          }
        }
      }, 500);

    });
    nameinp.addEventListener('blur', () => {
      nameinp.style.transform = `translate(0px, 0px)`
    })
    const uploadbutton = document.createElement('button');
    uploadbutton.style.marginTop = '5px';
    uploadbutton.innerHTML = 'Submit';
    uploadbutton.addEventListener('click', () => {
      uploadbutton.innerHTML = '<i class="fa fa-spinner fa-spin"></i>';
      pushToFirebase(nameinp);
    });
    parent.appendChild(info)
    parent.appendChild(nameinp);
    parent.appendChild(document.createElement('br'));
    parent.appendChild(uploadbutton);
    document.querySelectorAll('.addNumber').forEach(elm => {
      parent.removeChild(elm);
    });
    document.querySelectorAll('.numberAmount').forEach(elm => {
      parent.removeChild(elm);
    })
    document.querySelectorAll('br').forEach(elm => {
      if (elm.parentNode == parent) parent.removeChild(elm);
    })
  } else setError('The dataset is empty!', 1000);

}

function drawError() {
  push();
  fill(255);
  rect(0,0,width,height);
  fill(0);
  textSize(18);
  textAlign(CENTER, CENTER);
  text(error, width / 2, height / 2);
  pop();
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
  if (eraser) {
    eraser = false;
    e.style.opacity = 0.2;
    p.style.opacity = 1;
  } else {
    eraser = true;
    e.style.opacity = 1;
    p.style.opacity = 0.2;
  }
}

function displayGuess(confidence) {
  let max = 0;
  let bestGuess;
  for (let i = 0; i < confidence.length; i++) {
    document.querySelector(`#conf-${i}`).innerHTML = floor(confidence[i] * 100);
    if (confidence[i] > max) {
      max = confidence[i];
      bestGuess = i;
    }
  }
  document.querySelector('#bestGuess').innerHTML = bestGuess;
}
