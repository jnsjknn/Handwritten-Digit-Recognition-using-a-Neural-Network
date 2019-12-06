class NeuralNetwork {
  constructor(inputs, hidden1, hidden2, outputs) {
    this.inputs = inputs;
    this.hidden1 = hidden1;
    this.hidden2 = hidden2;
    this.outputs = outputs;
    this.weights_ih1 = new Matrix(this.hidden1, this.inputs);
    this.weights_h1h2 = new Matrix(this.hidden2, this.hidden1);
    this.weights_h2o = new Matrix(this.outputs, this.hidden2);
    this.bias_h1 = new Matrix(this.hidden1, 1);
    this.bias_h2 = new Matrix(this.hidden2, 1);
    this.bias_o = new Matrix(this.outputs, 1);
    this.weights_ih1.randomize();
    this.weights_h1h2.randomize();
    this.weights_h2o.randomize();
    this.bias_h1.randomize();
    this.bias_h2.randomize();
    this.bias_o.randomize();
    this.learning_rate = 0.01;
    this.learned = 0;
    this.batchOutputs = []
    this.batchSize = 1;
  }

  setLearningRate(lr) {
    this.learning_rate = lr;
  }
  setBatchSize(bs) {
    this.batchSize = bs;
  }

  async download(filename = 'NN.json') {
    var dataStr = await "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", filename);
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

  static loadNN(data) {
    const nn = new NeuralNetwork(data);
    nn.weights_ih1 = data.weights_ih;
    nn.weights_h1h2 = data.weights_h1h2;
    nn.weights_h2o = data.weights_h2o;
    nn.bias_h1 = data.bias_h1;
    nn.bias_h2 = data.bias_h2;
    nn.bias_o = data.bias_o;
    nn.learning_rate = data.learning_rate;
    return nn;
  }

  feedforward(input_array) {
    const inputs = Matrix.fromArray(input_array);
    inputs.map(mapInputs);

    const hidden1 = Matrix.multiply(this.weights_ih1, inputs);
    hidden1.add(this.bias_h1);
    hidden1.map(sigmoid);

    const hidden2 = Matrix.multiply(this.weights_h1h2, hidden1);
    hidden2.add(this.bias_h2);
    hidden2.map(sigmoid);

    const output = Matrix.multiply(this.weights_h2o, hidden2);
    output.add(this.bias_o);
    //output.map(sigmoid);
    output.softmax()
    return output.toArray();
  }

  train(input_array, target_array) {
    this.learned++;
    const inputs = Matrix.fromArray(input_array);
    inputs.map(mapInputs);

    const hidden1 = Matrix.multiply(this.weights_ih1, inputs);
    hidden1.add(this.bias_h1);
    hidden1.map(sigmoid);

    const hidden2 = Matrix.multiply(this.weights_h1h2, hidden1);
    hidden2.add(this.bias_h2);
    hidden2.map(sigmoid);

    const outputs = Matrix.multiply(this.weights_h2o, hidden2);
    outputs.add(this.bias_o);
    //outputs.map(sigmoid);
    //outputs.softmax()
    this.batchOutputs.push(outputs);
    if (this.batchOutputs.length >= this.batchSize) {
      outputs.multiply(0);
      this.batchOutputs.forEach(matrix => {
        outputs.add(matrix)
      });
      this.batchOutputs = [];
      outputs.softmax();
      let targets;
      if (typeof target_array == 'number') {
        switch (target_array) {
          case 0:
            targets = Matrix.fromArray([1, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
            break;
          case 1:
            targets = Matrix.fromArray([0, 1, 0, 0, 0, 0, 0, 0, 0, 0]);
            break;
          case 2:
            targets = Matrix.fromArray([0, 0, 1, 0, 0, 0, 0, 0, 0, 0]);
            break;
          case 3:
            targets = Matrix.fromArray([0, 0, 0, 1, 0, 0, 0, 0, 0, 0]);
            break;
          case 4:
            targets = Matrix.fromArray([0, 0, 0, 0, 1, 0, 0, 0, 0, 0]);
            break;
          case 5:
            targets = Matrix.fromArray([0, 0, 0, 0, 0, 1, 0, 0, 0, 0]);
            break;
          case 6:
            targets = Matrix.fromArray([0, 0, 0, 0, 0, 0, 1, 0, 0, 0]);
            break;
          case 7:
            targets = Matrix.fromArray([0, 0, 0, 0, 0, 0, 0, 1, 0, 0]);
            break;
          case 8:
            targets = Matrix.fromArray([0, 0, 0, 0, 0, 0, 0, 0, 1, 0]);
            break;
          case 9:
            targets = Matrix.fromArray([0, 0, 0, 0, 0, 0, 0, 0, 0, 1]);
            break;
        }
      } else {
        targets = Matrix.fromArray(target_array);
      }


      const output_errors = Matrix.subtract(targets, outputs);
      this.output_errors = output_errors;
      const gradient = Matrix.map(outputs, dsigmoid);
      gradient.multiply(output_errors);
      gradient.multiply(this.learning_rate);
      const hidden2_T = Matrix.transpose(hidden2);
      const weights_h2o_deltas = Matrix.multiply(gradient, hidden2_T);

      this.weights_h2o.add(weights_h2o_deltas);
      this.bias_o.add(gradient);

      const weights_h2o_T = Matrix.transpose(this.weights_h2o);
      const hidden2_errors = Matrix.multiply(weights_h2o_T, output_errors);
      const hidden2_gradient = Matrix.map(hidden2, dsigmoid);
      hidden2_gradient.multiply(hidden2_errors);
      hidden2_gradient.multiply(this.learning_rate);
      const hidden1_T = Matrix.transpose(hidden1);
      const weights_h1h2_deltas = Matrix.multiply(hidden2_gradient, hidden1_T);

      this.weights_h1h2.add(weights_h1h2_deltas);
      this.bias_h2.add(hidden2_gradient);

      const weights_h1h2_T = Matrix.transpose(this.weights_h1h2);
      const hidden1_errors = Matrix.multiply(weights_h1h2_T, hidden2_errors);
      const hidden1_gradient = Matrix.map(hidden1, dsigmoid);
      hidden1_gradient.multiply(hidden1_errors);
      hidden1_gradient.multiply(this.learning_rate);
      const inputs_T = Matrix.transpose(inputs);
      const weights_ih1_deltas = Matrix.multiply(hidden1_gradient, inputs_T);

      this.weights_ih1.add(weights_ih1_deltas);
      this.bias_h1.add(hidden1_gradient);
    }
  }
}


function unsigmoid(y) {
  return Math.log(-(y / (y - 1)))
}

function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

function dsigmoid(y) {
  // y = sigmoid(x)
  return y * (1 - y);
}

function unMapInputs(y) {
  return y * 255;
}

function mapInputs(x) {
  return x / 255;
}
