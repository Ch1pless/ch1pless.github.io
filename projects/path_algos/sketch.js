

function setup() {
    let canvas = createCanvas(config.width, config.height);
    canvas.parent('sketch-holder');

    G = new Graph();
    setupElements();
    setupPallete();
}

function mousePressed() {
    if (G.inGrid(mouseX, mouseY)) {
        let gridPos = G.screenToGrid(mouseX, mouseY);
        G.setCell(gridPos, config.cell);
        config.prevCell = gridPos;
    }
}

function mouseDragged() {
    let gridPos = G.screenToGrid(mouseX, mouseY);
    if ((gridPos.x != config.prevCell.x || gridPos.y != config.prevCell.y) &&
        config.cell == CellType.WALL &&
        G.inGrid(mouseX, mouseY)) {
        G.setCell(gridPos, config.cell);
        config.prevCell = gridPos;
    }
}

function mouseReleased() {
    config.prevCell = new Point(null, null);
}

function draw() {
    updateConfig();
    background(config.pallete.bg);
    G.render();
}

