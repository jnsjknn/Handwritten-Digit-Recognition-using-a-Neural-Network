let image;

function getDocument() {
  db.collection('newdata').where('checked', '==', false).limit(1).get()
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
  db.collection('newdata').doc(image.id).set(image)
    .then(function() {
      console.log("Document successfully written!");
    })
    .catch(function(error) {
      console.error("Error writing document: ", error);
    });
  setTimeout(() => getDocument(), 500);
}
function remove() {
  image.remove = true;
  db.collection('newdata').doc(image.id).delete()
    .then(function() {
      console.log("Document successfully deleted!");
    })
    .catch(function(error) {
      console.error("Error deleting document: ", error);
    });
  setTimeout(() => getDocument(), 500);
}

function setup() {
  const canvas = createCanvas(140, 140);
  canvas.parent('canvasDiv');
}

function draw() {
  if (image) drawImage();
}
function drawImage() {
  if (image.remove) getDocument();
  document.querySelector('#label').innerHTML = image.label;
  for (let i = 0; i < image.image.length; i++) {
    const x = 5 * (i % 28);
    const y = 5 * Math.floor(i / 28);
    noStroke();
    fill(image.image[i]);
    rect(x, y, 5, 5);
  }
}



// Poor password protection
function allowEditing() {
  const pass = document.querySelector('#pass').value;
  console.log(pass);
  if(pass == 'jns') {
    document.querySelector('#hide').style.display = 'block';
    document.querySelector('#pass').style.display = 'none';
    document.querySelector('#passBtn').style.display = 'none';
    getDocument();
  }
}





const promises = [
  fetch('../data/numbers/0.json').then(res=>res.json()),
  fetch('../data/numbers/1.json').then(res=>res.json())
]
let combined;
function loadAndCombine() {
  Promise.all(promises)
  .then(data => data.reduce((a,b)=>a.concat(b)))
  .then(data => combined = data);
}
