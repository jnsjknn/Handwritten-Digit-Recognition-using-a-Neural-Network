let numberPoints = [];
let eraser = false;
let error = false;
let scrollingAllowed = false;

function setup() {
  const canvas = createCanvas(280, 280);
  canvas.parent('canvasDiv');
  pixelDensity(1);
}
let images = false;

function draw() {
  background(255);
  if (numberPoints) drawPoints();
  if (eraser) drawEraseArea();
  if (error) drawError();
}

let imageset = [];

function addImage(label) {
  document.querySelector('#instructions').style.display = 'none';
  let scaledP = prepdata();
  if (scaledP) {
    imageset.push({
      image: scaledP,
      label: label
    });
    const amountElm = document.querySelector(`#amount${label}`);
    amountElm.innerHTML = parseInt(amountElm.innerHTML) + 1;
    numberPoints = [];
    for (let px of imageset[imageset.length - 1].image) {
      if (px == NaN) {
        setError("Something went wrong :( Try again!", 1000);
        return false;
      }
    }
  } else {
    setError("Draw a number first!", 1500);
  }
}

function deleteLastEntry() {
  if (imageset.length > 0) {
    const number = imageset.splice(imageset.length - 1, 1)[0].label
    console.log('label'+number)
    const elm = document.querySelector(`#amount${number}`);
    elm.innerHTML = parseInt(elm.innerHTML) - 1;
    console.table(imageset);
  } else {
    setError('Nothing to delete!', 1000);
  }
}

function pushToFirebase(nameinput) {
  let data = imageset.filter(obj => {
    if (!obj.image) return false;
    for (let i of obj.image) {
      if (i == null) return false;
    }
    return true;
  }).shuffle();
  for (let i=0;i<imageset.length;i++) {
    db.collection("newdata2").add(imageset[i])
      .then(function(docRef) {
        if (i==0) {
          setError('Please wait!', 3000);
        }
        if (i==imageset.length-1) {
          setError('Dataset sent!', 1500);
          const elm = document.querySelector('input[type="text"]');
          elm.value = `Imageset length: ${imageset.length} Credit: ${nameinput.value} ID: ${docRef.id}`;
          setTimeout(() => document.querySelector('input[type="submit"]').click(), 2200)
        }
      })
      .catch(error => {
        setError('Uploading failed! Sorry..', 3000);
        console.log(error)
      });
  }

}
