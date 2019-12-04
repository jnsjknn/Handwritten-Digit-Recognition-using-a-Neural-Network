const options = {
  learningRate: 0.1,
  epochs: 50,
  learningRateDivider: 2,
  modifyLearningRateEvery: 1,
  verbose: true,
  test: 'onEpochEnd',
  errorTreshold: 10,
  batchSize: 32
}

const nn = new NeuralNetwork(784, 400, 80, 10);

async function train(options) {
  let data = await fetch('../data/dataset.json').then(res => res.json());
  data = data.shuffle();
  const trainingData = data.slice(0, Math.floor(data.length * 0.9));
  const testingData = data.slice(Math.floor(data.length * 0.9), data.length - 1)
  const iterations = options.epochs * trainingData.length;
  nn.setLearningRate(options.learningRate);
  nn.setBatchSize(options.batchSize);
  const startTime = new Date().getTime();
  for (let i = 0; i < options.epochs; i++) {
    if (i != 0 && i % options.modifyLearningRateEvery == 0) {
      nn.setLearningRate(nn.learning_rate / options.learningRateDivider);
      console.log('Learning rate modified: ' + nn.learning_rate);
    }
    const shuffled = trainingData.shuffle();
    shuffled.forEach((datapoint, index) => {
      nn.train(datapoint.image, datapoint.label);
      if (options.verbose && index % 5000 == 0 && index != 0) {
        let logText = ''
        const progress = 100 * nn.learned / iterations;
        logText += 'Progress:' + progress.toFixed(4) + '%\n';

        const time = new Date().getTime();
        const elapsedMill = time - startTime;
        const elapsedMin = elapsedMill / 1000 / 60;
        const elapsedSec = (elapsedMin - Math.floor(elapsedMin)) * 60;
        logText += 'Elapsed time: ' + Math.floor(elapsedMin) + 'min ' + Math.floor(elapsedSec) + 's\n';

        const speed = nn.learned / elapsedMill;
        const timeLeftMill = (iterations - nn.learned) / speed;
        const timeLeftMin = timeLeftMill / 1000 / 60;
        const timeLeftSec = (timeLeftMin - Math.floor(timeLeftMin)) * 60;
        logText += 'Time left: ' + Math.floor(timeLeftMin) + 'min ' + Math.floor(timeLeftSec) + 's\n';

        const trainingError = nn.output_errors.values.reduce((a, b) => Math.abs(a) + Math.abs(b)) * 10;
        logText += 'Training error: ' + trainingError.toFixed(4) + '%';
        console.log(logText);
      }
    });
    if (options.test == 'onEpochEnd') {
      const testError = test(testingData);
      console.log('Testing error: ' + testError + ' Epoch: ' + (i + 1) + '/' + options.epochs);
      if (testError < options.errorTreshold) {
        console.log('Training stopped: Reached error treshold!');
        return;
      }
    }
  }
  if (options.test == 'afterTraining') {
    const testError = test(testingData);
    console.log('Testing error: ' + testError);
    console.log('Training finished.')
  }
}

function test(testingData) {
  const shuffledTestingData = testingData.shuffle();
  let guesses = [];
  for (let datapoint of shuffledTestingData) {
    const guess = nn.feedforward(datapoint.image);
    guesses.push(guess);
  };
  guesses = guesses.map(guessArray => {
    let best = 0;
    let bestGuess;
    for (let guess of guessArray) {
      if (guess > best) {
        best = guess;
        bestGuess = guessArray.indexOf(guess);
      }
    }
    return bestGuess;
  });
  let correct = 0;
  let total = 0;
  guesses.forEach((guess, index) => {
    if (guess == testingData[index].label) correct++;
    total++;
  });
  const testError = 100 - (100 * correct / total);
  return testError;
}
