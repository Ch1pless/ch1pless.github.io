class Sort {
    constructor(N) {
      this.N = N;
      this.numbers = new Array(N).fill().map((_, index) => index + 1);
      this.currIdx = 0;
    }
    
    render() {
      push();
      noStroke();
      for (let i = 0; i < this.N; i++) {
        let inter = map(i, 0, this.N, 0, 1);
        fill(lerpColor(config.pallete.grad1, config.pallete.grad2, inter));
        if (i == this.currIdx)
          fill(config.pallete.curr);
        
        let x = i * config.wScale;
        let y = this.numbers[i] * config.hScale;
        
        rect(x, height - y, config.wScale + 0.5, y + 0.5);
      }
      pop();
    }
    
    randomize() {
      for (let i = 0; i < this.N; i++) {
        let randIndex = floor(random(0, this.N));
        Sort.swap(this.numbers, i, randIndex);
      }
    }
    
    async bubbleSort() {
      for (let i = 0; i < this.N-1; i++)
      {
        for (let j = 0; j < this.N-i-1; j++)
        {
          if (this.numbers[j] > this.numbers[j+1])
          {
            this.currIdx = Sort.swap(this.numbers,j,j+1);
            await sleep(1000 / (frameRate() * config.speed));
          }
        }
      }  
    }
    
    async partition(arr, low, high) {
      let pivot = arr[high];
      
      let i = low - 1;
      for (let j = low; j < high; j++) {
        if (arr[j] <= pivot) {
          i++;
          this.currIdx = Sort.swap(arr, i, j);
          await sleep(1000 / (frameRate() * config.speed));
        }
      }
      this.currIdx = Sort.swap(arr, i + 1, high);
      await sleep(1000 / (frameRate() * config.speed));
      
      return i + 1;
    }
    
    async quickSort(arr, low, high) {
      let stack = new Array(high - low + 1).fill(0);
      
      let top = -1;
      
      stack[++top] = low;
      stack[++top] = high;
      
      while (top >= 0) {
        high = stack[top--];
        low = stack[top--];
        let parIdx = await this.partition(arr, low, high);
        
        if (parIdx - 1 > low) {
          stack[++top] = low;
          stack[++top] = parIdx - 1;
        }
        
        if (parIdx + 1 < high) {
          stack[++top] = parIdx + 1;
          stack[++top] = high;
        }
      }
    }
    
    static swap(arr, i1, i2) {
      let temp = arr[i1];
      arr[i1] = arr[i2];
      arr[i2] = temp;
      return i2;
    }
  }
  
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }