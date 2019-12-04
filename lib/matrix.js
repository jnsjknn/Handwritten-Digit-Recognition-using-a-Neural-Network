class Matrix {
  constructor(rows, cols) {
    this.rows = rows;
    this.cols = cols;
    this.values = [];

    for (let i = 0; i < this.rows; i++) {
      this.values[i] = [];
      for (let j = 0; j < this.cols; j++) {
        this.values[i][j] = 0;
      }
    }
  }

  copy() {
    let m = new Matrix(this.rows, this.cols);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        m.data[i][j] = this.data[i][j];
      }
    }
    return m;
  }

  static fromArray(array) {
    let result = new Matrix(array.length, 1);
    for (let i = 0; i < array.length; i++) {
      result.values[i][0] = array[i];
    }
    return result;
  }

  toArray() {
    let arr = [];
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        arr.push(this.values[i][j]);
      }
    }
    return arr;
  }

  map(f) {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        this.values[i][j] = f(this.values[i][j]);
      }
    }
  }

  softmax() {
    let denominator = 0;
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        this.values[i][j] = Math.exp(this.values[i][j]);
        denominator += this.values[i][j];
      }
    }
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        this.values[i][j] /= denominator;
      }
    }

    return this;
  }

  static map(matrix, f) {
    let result = new Matrix(matrix.rows, matrix.cols);
    for (let i = 0; i < matrix.rows; i++) {
      for (let j = 0; j < matrix.cols; j++) {
        result.values[i][j] = f(matrix.values[i][j]);
      }
    }
    return result;
  }

  static transpose(m) {
    if (m instanceof Matrix) {
      let result = new Matrix(m.cols, m.rows);
      for (let i = 0; i < m.rows; i++) {
        for (let j = 0; j < m.cols; j++) {
          result.values[j][i] = m.values[i][j];
        }
      }
      return result;
    } else {
      console.log("Argument is not a matrix.")
    }
  }

  transpose() {
    console.log('Use Matrix.transpose(m1)');
  }

  // HADAMARD PRODUCT AND SCALAR MULTIPLICATION
  multiply(m) {
    if (m instanceof Matrix) {
      if (this.rows == m.rows && this.cols == m.cols) {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.cols; j++) {
            this.values[i][j] *= m.values[i][j];
          }
        }
      } else {
        console.log('Dimensions of the matrixes must match');
      }
    } else {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.cols; j++) {
          this.values[i][j] *= m;
        }
      }
    }
  }

  // MATRIX PRODUCT
  static multiply(a, b) {
    if (a.cols == b.rows) {
      let result = new Matrix(a.rows, b.cols);
      for (let i = 0; i < result.rows; i++) {
        for (let j = 0; j < result.cols; j++) {
          let sum = 0;
          for (let k = 0; k < a.cols; k++) {
            sum += a.values[i][k] * b.values[k][j];
          }
          result.values[i][j] = sum;
        }
      }
      return result;
    } else {
      console.log("a.rows doesn't match b.cols");
    }
  }

  static add(m1, m2) {
    if (m1.rows == m2.rows && m1.cols == m2.cols) {
      let result = new Matrix(m1.rows, m1.cols);
      for (let i = 0; i < m1.rows; i++) {
        for (let j = 0; j < m1.cols; j++) {
          result.values[i][j] = m1.values[i][j] + m2.values[i][j];
        }
      }
      return result;
    } else {
      console.log('Dimensions of the matrixes must match');
    }
  }

  add(m) {
    if (m instanceof Matrix) {
      if (this.rows == m.rows && this.cols == m.cols) {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.cols; j++) {
            this.values[i][j] += m.values[i][j];
          }
        }
      } else {
        console.log('Dimensions of the matrixes must match');
      }
    } else {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.cols; j++) {
          this.values[i][j] += m;
        }
      }
    }
  }

  static subtract(m1, m2) {
    if (m1.rows == m2.rows && m1.cols == m2.cols) {
      let result = new Matrix(m1.rows, m1.cols);
      for (let i = 0; i < m1.rows; i++) {
        for (let j = 0; j < m1.cols; j++) {
          result.values[i][j] = m1.values[i][j] - m2.values[i][j];
        }
      }
      return result;
    } else {
      console.log('Dimensions of the matrixes must match');
    }
  }

  subtract(m) {
    if (m instanceof Matrix) {
      if (this.rows == m.rows && this.cols == m.cols) {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.cols; j++) {
            this.values[i][j] -= m.values[i][j];
          }
        }
      } else {
        console.log('Dimensions of the matrixes must match');
      }
    } else {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.cols; j++) {
          this.values[i][j] -= m;
        }
      }
    }
  }

  randomize() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        this.values[i][j] = Math.random() * 2 - 1;
      }
    }
  }

  log() {
    console.table(this.values);
  }

}
