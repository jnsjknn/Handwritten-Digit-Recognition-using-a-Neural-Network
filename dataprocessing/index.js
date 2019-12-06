let image;
let collection = 'newdata';

function getDocument() {
  db.collection(collection).where('checked', '==', false).limit(1).get()
    .then(snapshot => {
      snapshot.forEach(val => {
        const obj = val.data();
        obj.id = val.id;
        image = obj;
      })
    }).catch(err => console.log(err));
}

function rewrite(newlabel = image.label) {
  image.label = newlabel;
  image.checked = true;
  db.collection(collection).doc(image.id).set(image)
    .then(function() {
      console.log("Document successfully written!");
    })
    .catch(function(error) {
      console.error("Error writing document: ", error);
    });
  setTimeout(() => getDocument(), 500);
}

function del() {
  db.collection(collection).doc(image.id).delete()
    .then(function() {
      console.log("Document successfully deleted!");
    })
    .catch(function(error) {
      console.error("Error deleting document: ", error);
    });
  setTimeout(() => getDocument(), 500);
}

function setup() {
  const canvas = createCanvas(300, 300);
  canvas.parent('canvasDiv');
}

function draw() {
  //scale(2,2)
  if (image) drawImage();
}

function drawImage() {
  //background(255);
  if (image.remove) getDocument();
  document.querySelector('#label').innerHTML = image.label;
  const w = Math.floor(Math.sqrt(image.image.length));
  const scale = 5;
  for (let i = 0; i < image.image.length; i++) {
    const x = scale * (i % w);
    const y = scale * Math.floor(i / w);
    noStroke();
    fill(image.image[i]);
    rect(x, y, scale, scale);
  }
  noFill();
  stroke(0);
  rect(0, 0, w*scale, w*scale);
}



// Poor password protection
function allowEditing() {
  const pass = document.querySelector('#pass').value;
  console.log(pass);
  if (pass.toLowerCase() == 'jns') {
    document.querySelector('#hide').style.display = 'block';
    document.querySelector('#pass').style.display = 'none';
    document.querySelector('#passBtn').style.display = 'none';
    getDocument();
  }
}

const promises = [
  fetch('../data/numbers/0.json').then(res => res.json()),
  fetch('../data/numbers/1.json').then(res => res.json())
]
let combined;

function loadAndCombine() {
  Promise.all(promises)
    .then(data => data.reduce((a, b) => a.concat(b)))
    .then(data => combined = data);
}
