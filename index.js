let numberPoints = [];
let eraserOn = false;
let nn = new NeuralNetwork(784, 300, 60, 10);

fetch('data/NN2.json')
  .then(res => res.json())
  .then(taughtnn => {
    nn.weights_ih1.values = taughtnn.weights_ih1.values;
    nn.weights_h1h2.values = taughtnn.weights_h1h2.values;
    nn.weights_h2o.values = taughtnn.weights_h2o.values;
    nn.bias_h1.values = taughtnn.bias_h1.values;
    nn.bias_h2.values = taughtnn.bias_h2.values;
    nn.bias_o.values = taughtnn.bias_o.values;
  });

function setup() {
  const canvas = createCanvas(280, 280);
  canvas.parent('canvasDiv');
  pixelDensity(1);
}

function draw() {
  background(255);
  if (numberPoints) drawPoints();
  if (eraserOn) drawEraseArea();
}

function guess() {
  let scaledP = prepdata();
  if (scaledP) {
    const confidences = nn.feedforward(scaledP);
    //console.table(confidences.indexOf(Math.max(...confidences)));
    // const confidences = [1,1,1,1,1,1,1,1,1];
    for (let i = 0; i < confidences.length; i++) {
      const elm = document.querySelector(`#confbar${i}`);
      elm.style.height = (100 * confidences[i] + 5) + '%';
    }
  }
}
