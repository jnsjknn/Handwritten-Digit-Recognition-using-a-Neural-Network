const options = {
  learningRate: 0.01,
  epochs: 20,
  learningRateDivider: 2,
  modifyLearningRateEvery: 5,
  verbose: true,
  testOnEpochEnd: true,
  accuracyTreshold: 99.9,
  batchSize: 1
}

const nn = new NeuralNetwork(784, 300, 60, 10);

async function train(options) {
  console.log(options);
  let data = await fetch('../data/dataset.json').then(res => res.json());
  data = data.map(datapt => {
    const obj = datapt;
    obj.image = normalize(obj.image);
    return obj;
  })
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
      console.log('%c Learning rate modified: ' + nn.learning_rate, 'background: rgba(0,43,193,0.3)');
    }
    const shuffled = trainingData.shuffle();
    shuffled.forEach((datapoint, index) => {
      nn.train(datapoint.image, datapoint.label);
      if (options.verbose && nn.learned % 2000 == 0) {
        const time = new Date().getTime();
        const elapsedMill = time - startTime;
        const speed = nn.learned / elapsedMill;
        const timeLeftMill = (iterations - nn.learned) / speed;
        const timeLeftMin = timeLeftMill / 1000 / 60;
        const timeLeftSec = (timeLeftMin - Math.floor(timeLeftMin)) * 60;
        let logText = `Estim. remaining: ${Math.floor(timeLeftMin)}min ${Math.floor(timeLeftSec)}s (${Math.floor(speed*1000)} iter/s)\n`
        logText += `Total progress: ${(100 * nn.learned / iterations).toFixed(3)} %\n`;
        logText += `Epoch progress: ${(100 * index / shuffled.length).toFixed(3)} %\n`;
        logText += `Epoch: ${(i + 1)}/${options.epochs}`;
        console.log(logText);
      }
    });

    if (options.testOnEpochEnd == true) {
      const testAccuracy = test(testingData);
      console.log('%c Testing accuracy: ' + testAccuracy + ' Epoch: ' + (i + 1) + '/' + options.epochs, 'background: rgba(0,193,48,0.3); font-weight: bold');
      if (testAccuracy > options.accuracyTreshold) {
        console.log('Training stopped: Reached accuracy treshold!');
        return;
      }
    }
  }
  const testAccuracy = test(testingData);
  console.log('%c Training finished ', 'background: rgba(0,193,48,1); font-weight: bold; text-transform: uppercase; font-size: 30px')
  console.log(options);
  nn.trainingOptions = options;
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
  const testAccuracy = 100 * correct / total;
  return testAccuracy;
}
