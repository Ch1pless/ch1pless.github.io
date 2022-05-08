class GoldenRatio {
    constructor() {
      this.ratio = 1.61803398875; // approximation
    }
    
    render() {
      push();
      strokeWeight(5);
      for (let i = 0; i < config.points; i++) {
        let inter = map(i, 0, config.points, 0, 1);
        stroke(lerpColor(config.pallete.grad1, config.pallete.grad2, inter));
        let x = sin(i * config.twist) * this.ratio * i * config.spread;
        let y = cos(i * config.twist) * this.ratio * i * config.spread;
        point(x, y);
      }
      pop();
    }
  }