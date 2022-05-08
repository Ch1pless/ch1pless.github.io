"esversion: 8";



function palletes(choice) {
  let colors = {
    bg: color('#12151f'),
    curr: color('#a00000')
  }
  switch (choice) {
    case 'white':
      colors.grad1 = color('#ffffff');
      colors.grad2 = color('#ffffff');
      config.pallete = colors;
      break;
    case 'sel':
      colors.grad1 = color('#00467f');
      colors.grad2 = color('#a5cc82');
      config.pallete = colors;
      break;
    case 'evening sunshine':
      colors.grad1 = color('#b92b27');
      colors.grad2 = color('#1565c0');
      config.pallete = colors;
      break;
    case 'ultra violet':
      colors.grad1 = color('#654ea3');
      colors.grad2 = color('#eaafc8');
      config.pallete = colors;
      break;
  }
}

function inputsSetup() {
  inputs.pallete = createSelect();
  inputs.pallete.position(10, 10);
  inputs.pallete.option('White', 'white');
  inputs.pallete.option('Sel', 'sel');
  inputs.pallete.option('Evening Sunshine', 'evening sunshine');
  inputs.pallete.option('Ultra Violet', 'ultra violet')
  inputs.pallete.selected('sel');
  inputs.pallete.changed(() => palletes(inputs.pallete.value()));
  inputs.pallete.parent('sketch-holder');
  
  inputs.N = createSlider(10, 1000, 100, 1);
  inputs.N.position(10, 40);
  inputs.N.parent('sketch-holder');
  
  inputs.speed = createSlider(0.1, 10, 1, 0.1);
  inputs.speed.position(10, 70);
  inputs.speed.parent('sketch-holder');
  
  inputs.method = createSelect();
  inputs.method.position(150, 10);
  inputs.method.option('Bubble Sort', 'bubble');
  inputs.method.option('Quick Sort', 'quick');
  inputs.method.selected('bubble');
  inputs.method.parent('sketch-holder');
}

function textSetup() {
  texts.N = createDiv();
  texts.N.position(190, 40);
  texts.N.style('color', color('#ffffff'));
  texts.N.style('text-shadow', '-1px -1px 0 #000,\
                                1px -1px 0 #000, \
                                -1px 1px 0 #000, \
                                1px 1px 0 #000');
  texts.N.html(`Size: ${config.N}`);
  texts.N.parent('sketch-holder');
  
  texts.speed = createDiv();
  texts.speed.position(190, 70);
  texts.speed.style('color', color('#ffffff'));
  texts.speed.style('text-shadow', '-1px -1px 0 #000,\
                                1px -1px 0 #000, \
                                -1px 1px 0 #000, \
                                1px 1px 0 #000');
  texts.speed.html(`Speed: ${config.speed}`);
  texts.speed.parent('sketch-holder');
}

function configUpdater() {
  if (inputs.N.value() != config.N) {
    config.N = inputs.N.value();
    config.wScale = config.width / config.N;
    config.hScale = config.height / config.N;
    
    texts.N.html(`Size: ${config.N}`);
    
    config.sort = new Sort(config.N);
    config.sort.randomize();
    startSort();
  }
  
  if (inputs.speed.value() != config.speed) {
    config.speed = inputs.speed.value();
    
    texts.speed.html(`Speed: ${config.speed}`);
  }
  
  if (inputs.method.value() != config.method) {
    config.method = inputs.method.value();
    
    config.sort = new Sort(config.N);
    config.sort.randomize();
    startSort();
  }
}


function startSort() {
  switch (config.method) {
    case "bubble":
      config.sort.bubbleSort();
      break;
    case "quick":
      config.sort.quickSort(config.sort.numbers, 0, config.sort.N - 1);
      break;
    default:
      config.sort.bubbleSort();
      break;
  }
}


function setup() {
  inputsSetup();
  textSetup();
  palletes(inputs.pallete.value());

  config.wScale = config.width / config.N;
  config.hScale = config.height / config.N;
  config.sort = new Sort(config.N);
  config.sort.randomize();
  
  
  let canvas = createCanvas(config.width, config.height);
  canvas.parent('sketch-holder');
  startSort();
}

function draw() {
  configUpdater();
  background(config.pallete.bg);
  config.sort.render();
}

