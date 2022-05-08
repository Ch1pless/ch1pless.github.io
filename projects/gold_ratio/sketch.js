function palletes(choice) {
    let colors = {
        bg: color('#12151f')
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

function setupElements() {
    inputs.points = createSlider(100, 1000, 200, 10);
    inputs.points.position(10, 10);
    inputs.points.parent('sketch-holder');

    inputs.twist = createSlider(0.1, 5, 1, 0.1);
    inputs.twist.position(10, 40);
    inputs.twist.parent('sketch-holder');

    inputs.spread = createSlider(0.1, 5, 1, 0.1);
    inputs.spread.position(10, 70);
    inputs.spread.parent('sketch-holder');

    texts.points = createDiv();
    texts.points.position(185, 10);
    texts.points.style('color', color('#ffffff'));
    texts.points.style('text-shadow', '-1px -1px 0 #000,\
                                    1px -1px 0 #000, \
                                    -1px 1px 0 #000, \
                                    1px 1px 0 #000');
    texts.points.html(`Points: ${config.points}`);
    texts.points.parent('sketch-holder');

    inputs.pallete = createSelect();
    inputs.pallete.position(10, 100);
    inputs.pallete.option('White', 'white');
    inputs.pallete.option('Sel', 'sel');
    inputs.pallete.option('Evening Sunshine', 'evening sunshine');
    inputs.pallete.option('Ultra Violet', 'ultra violet')
    inputs.pallete.selected('sel');
    inputs.pallete.changed(() => palletes(inputs.pallete.value()));
    inputs.pallete.parent('sketch-holder');

    texts.twist = createDiv();
    texts.twist.position(185, 40);
    texts.twist.style('color', color('#ffffff'));
    texts.twist.style('text-shadow', '-1px -1px 0 #000,\
                                    1px -1px 0 #000, \
                                    -1px 1px 0 #000, \
                                    1px 1px 0 #000');
    texts.twist.html(`Twist: ${config.twist}`);
    texts.twist.parent('sketch-holder');

    texts.spread = createDiv();
    texts.spread.position(185, 70);
    texts.spread.style('color', color('#ffffff'));
    texts.spread.style('text-shadow', '-1px -1px 0 #000,\
                                    1px -1px 0 #000, \
                                    -1px 1px 0 #000, \
                                    1px 1px 0 #000');
    texts.spread.html(`Spread: ${config.spread}`);
    texts.spread.parent('sketch-holder');
}

function configUpdater() {
    if (inputs.points.value() != config.points) {
        config.points = inputs.points.value();
        texts.points.html(`Points: ${config.points}`);
    }

    if (inputs.twist.value() != config.twist) {
        config.twist = inputs.twist.value();
        texts.twist.html(`Twist: ${config.twist}`);
    }

    if (inputs.spread.value() != config.spread) {
        config.spread = inputs.spread.value();
        texts.spread.html(`Spread: ${config.spread}`);
    }
}

function setup() {
    setupElements();
    palletes(inputs.pallete.value());
    config.gr = new GoldenRatio();

    let canvas = createCanvas(config.width, config.height);
    canvas.parent('sketch-holder');
}

function draw() {
    configUpdater();
    background(config.pallete.bg);
    translate(width/2, height/2);
    config.gr.render();
}