class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    equals(point) {
        return this.x == point.x && this.y == point.y;
    }

    toString() {
        return `(${this.x}, ${this.y})`;
    }
}

let config = {
    width: window.innerWidth,
    height: window.innerHeight,
    pallete: {},
    scale: 50,
    running: false,
    topOffset: 50,
    cell: null,
    prevCell: new Point(null, null),
    start: new Point(0, 0),
    goal: new Point(3, 3),
    method: null
}

let G;

let inputs = {
    method: null,
    running: null,
    clear: null,
    cell: null,
    scale: null
}

let texts = {
    scale: null
}

function setupPallete() {
    config.pallete = {
        bg: color('#4C371E'),
        wall: color('#6E5846'),
        visited: color('#E9E3DE'),
        empty: color('#FAF7F1'),
        active: color('#DDCBB3'),
        start: color('#CAAD8A'),
        path: color('#A0846B'),
        goal: color('#826231')
    }
}

function setupElements() {
    inputs.method = createSelect();
    inputs.method.position(10, 10);
    inputs.method.option('Breadth First', Algorithm.BFS);
    inputs.method.option('Depth First', Algorithm.DFS);
    //inputs.method.option('Bellman-Ford', Algorithm.BFA);
    inputs.method.option('Dijkstra\'s', Algorithm.DA);
    inputs.method.option('A Star', Algorithm.ASTAR);
    inputs.method.parent('sketch-holder');

    inputs.cell = createSelect();
    inputs.cell.position(124, 10);
    inputs.cell.option('Start', CellType.START);
    inputs.cell.option('Wall', CellType.WALL);
    inputs.cell.option('Goal', CellType.GOAL);
    inputs.cell.parent('sketch-holder');

    inputs.running = createButton('Toggle Start/Stop');
    inputs.running.position(190, 10);
    inputs.running.mousePressed(toggleEvent);
    inputs.running.parent('sketch-holder');

    inputs.clear = createButton('Clear');
    inputs.clear.position(310, 10);
    inputs.clear.mousePressed(() => { G.clear(); });
    inputs.clear.parent('sketch-holder');

    inputs.scale = createSlider(25, 100, 50, 5);
    inputs.scale.position(360, 10);
    inputs.scale.parent('sketch-holder');

    texts.scale = createDiv();
    texts.scale.position(530, 12.5);
    texts.scale.style('color', '#fff');
    texts.scale.html(`Scale: ${config.scale}`);
    texts.scale.parent('sketch-holder');
}

function updateConfig() {
    if (config.method != inputs.method.value()) {
        config.method = floor(inputs.method.value());
    }


    if (config.scale != inputs.scale.value()) {
        config.scale = inputs.scale.value();
        texts.scale.html(`Scale: ${config.scale}`);
        G = new Graph();
    }

    if (config.cell != inputs.cell.value()) {
        config.cell = floor(inputs.cell.value());
    }
}

function toggleEvent() {
    let temp = config.running;
    G.clear();
    config.running = temp;
    config.running = !config.running;
    if (config.running) {
        switch (config.method) {
            case Algorithm.BFS:
                BFS();
                break;
            case Algorithm.DFS:
                DFS();
                break;
            case Algorithm.BFA:
                BFA();
                break;
            case Algorithm.DA:
                DA();
                break;
            case Algorithm.ASTAR:
                ASTAR();
                break;
        }
    }
}

const CellType = {
    EMPTY: 0,
    START: 1,
    GOAL: 2,
    WALL: 3,
    VISITED: 4,
    ACTIVE: 5,
    PATH: 6
};
Object.freeze(CellType);

const Algorithm = {
    BFS: 1,
    DFS: 2,
    BFA: 3,
    DA: 4,
    ASTAR: 5
};
Object.freeze(Algorithm);

class Graph {
    constructor() {
        let usableHeight = height - config.topOffset;
        this.offsetX = width % config.scale / 2;
        this.offsetY = usableHeight % config.scale / 2;
        this.gridX = (width - width % config.scale) / config.scale;
        this.gridY = (usableHeight - usableHeight % config.scale) / config.scale;

        this.grid = new Array(this.gridX);
        for (let i = 0; i < this.gridX; i++) {
            this.grid[i] = new Array(this.gridY).fill(CellType.EMPTY);
        }

        this.start = config.start;
        this.goal = config.goal;
    }



    clear() {
        if (config.running)
            config.running = !config.running;
        for (let i = 0; i < this.gridX; i++) {
            for (let j = 0; j < this.gridY; j++) {
                if (this.grid[i][j] == CellType.ACTIVE || this.grid[i][j] == CellType.VISITED || this.grid[i][j] == CellType.PATH) {
                    this.grid[i][j] = CellType.EMPTY;
                }

            }
        }
        if (this.start)
            this.grid[this.start.x][this.start.y] = CellType.START;
        if (this.goal)
            this.grid[this.goal.x][this.goal.y] = CellType.GOAL;
    }

    neighbors(cell) {
        let res = [];
        let upPoint = new Point(cell.x, cell.y - 1);
        let rightPoint = new Point(cell.x + 1, cell.y);
        let downPoint = new Point(cell.x, cell.y + 1);
        let leftPoint = new Point(cell.x - 1, cell.y);
        if (upPoint.y >= 0) res.push(upPoint);
        if (rightPoint.x < this.gridX) res.push(rightPoint);
        if (downPoint.y < this.gridY) res.push(downPoint);
        if (leftPoint.x >= 0) res.push(leftPoint);
        return res;
    }

    inGrid(x, y) {
        return (x > this.offsetX && x < this.gridX * config.scale + this.offsetX &&
            y > this.offsetY + config.topOffset && y < height - this.offsetY)
    }

    screenToGrid(x, y) {
        let convertedX = floor((x - this.offsetX) / config.scale);
        let convertedY = floor((y - this.offsetY - config.topOffset) / config.scale);

        return new Point(convertedX, convertedY);
    }

    setCell(cell, cellType) {
        switch (cellType) {
            case CellType.START:
                if (this.start)
                    this.grid[this.start.x][this.start.y] = CellType.EMPTY;
                this.grid[cell.x][cell.y] = CellType.START;
                this.start = cell;
                config.start = this.start;
                break;

            case CellType.GOAL:
                if (this.goal)
                    this.grid[this.goal.x][this.goal.y] = CellType.EMPTY;
                this.grid[cell.x][cell.y] = CellType.GOAL;
                this.goal = cell;
                config.goal = this.goal;
                break;

            case CellType.WALL:
                if (this.grid[cell.x][cell.y] != CellType.WALL) {
                    switch (this.grid[cell.x][cell.y]) {
                        case CellType.START:
                            this.start = null;
                            break;
                        case CellType.GOAL:
                            this.goal = null;
                            break;
                    }
                    this.grid[cell.x][cell.y] = CellType.WALL;
                }
                else
                    this.grid[cell.x][cell.y] = CellType.EMPTY;
                break;
            default:
                this.grid[cell.x][cell.y] = cellType;
                break;
        }

    }

    getCell(cell) {
        return this.grid[cell.x][cell.y];
    }

    render() {
        push();
        noStroke();
        for (let i = 0; i < this.gridX; i++) {
            for (let j = 0; j < this.gridY; j++) {
                this.drawCell(new Point(i, j), this.grid[i][j]);
            }
        }
        if (this.start)
            this.drawCell(this.start, CellType.START);
        if (this.goal)
            this.drawCell(this.goal, CellType.GOAL);
        pop();
    }

    drawCell(cell, cellType) {
        this.fillSet(cellType);
        rect(cell.x * config.scale + this.offsetX,
            cell.y * config.scale + this.offsetY + config.topOffset,
            config.scale + 0.5,
            config.scale + 0.5, 7.5);
    }

    fillSet(cellType) {
        switch (cellType) {
            case CellType.EMPTY:
                fill(config.pallete.empty);
                break;
            case CellType.WALL:
                fill(config.pallete.wall);
                break;
            case CellType.START:
                fill(config.pallete.start);
                break;
            case CellType.GOAL:
                fill(config.pallete.goal);
                break;
            case CellType.VISITED:
                fill(config.pallete.visited);
                break;
            case CellType.ACTIVE:
                fill(config.pallete.active);
                break;
            case CellType.PATH:
                fill(config.pallete.path);
                break;
        }
    }
}

async function BFS() {
    let queue = [];
    let parent = {};

    // Start BFS by setting start to active.
    G.setCell(G.start, CellType.ACTIVE);
    queue.push(G.start);

    // Continue until the posible paths have all been tried.
    while (queue.length != 0) {
        // Set cell to visited, check if cell is the goal, and get neighboring cells.
        let cell = queue.shift();
        G.setCell(cell, CellType.VISITED);

        if (G.goal.equals(cell)) break;

        let neighbors = G.neighbors(cell);
        // For neighbors, build a parent history and push to queue to continue searching.
        for (let i = 0; i < neighbors.length; i++) {
            let currType = G.getCell(neighbors[i]);
            if (currType != CellType.VISITED &&
                currType != CellType.WALL &&
                currType != CellType.ACTIVE) {
                parent[neighbors[i]] = cell;
                G.setCell(neighbors[i], CellType.ACTIVE);
                queue.push(neighbors[i]);
            }
        }

        await sleep(1000 / frameRate());
        if (!config.running) return;
    }

    let cell = G.goal;
    while (cell in parent) {
        G.setCell(cell, CellType.PATH);
        cell = parent[cell];

        await sleep(1000 / frameRate());
        if (!config.running) return;
    }
}

async function DFS() {
    let stack = [];
    let parent = {};

    G.setCell(G.start, CellType.ACTIVE);
    stack.push(G.start);
    while (stack.length != 0) {
        let cell = stack.pop();
        G.setCell(cell, CellType.VISITED);
        if (G.goal.equals(cell)) break;
        let neighbors = G.neighbors(cell);
        for (let i = 0; i < neighbors.length; i++) {
            let currType = G.getCell(neighbors[i]);
            if (currType != CellType.VISITED &&
                currType != CellType.WALL &&
                currType != CellType.ACTIVE) {
                parent[neighbors[i]] = cell;
                G.setCell(neighbors[i], CellType.ACTIVE);
                stack.push(neighbors[i]);
            }
        }
        await sleep(1000 / frameRate());
        if (!config.running) return;
    }

    let cell = G.goal;
    while (cell in parent) {
        G.setCell(cell, CellType.PATH);
        cell = parent[cell];
        await sleep(1000 / frameRate());
        if (!config.running) return;
    }
}

async function BFA() {
    let distance = {};
    let parent = {};

    for (let i = 0; i < G.gridX; i++) {
        for (let j = 0; j < G.gridY; j++) {
            distance[new Point(i, j)] = Infinity;
        }
    }

    distance[G.start] = 0;
    for (let h = 0; h < G.gridX * G.gridY; h++) {
        for (let i = 0; i < G.gridX; i++) {
            for (let j = 0; j < G.gridY; j++) {
                let neighbors = G.neighbors(new Point(i, j));
                for (let k = 0; k < neighbors.length; k++) {
                    let cell = G.getCell(neighbors[k]);
                    if (cell != CellType.WALL) {
                        let u = new Point(i, j);
                        let v = neighbors[k];
                        if (distance[u] + 1 < distance[v]) {
                            distance[v] = distance[u] + 1;
                            parent[v] = u;
                        }
                    }
                }
            }
        }
        if (h % 100)
            await sleep(1);
    }
    let cell = G.goal;
    while (!cell.equals(G.start)) {
        G.setCell(cell, CellType.PATH);
        cell = parent[cell];
        await sleep(1000 / frameRate());
        if (!config.running) return;
    }
}

async function DA() {
    let distance = {};
    let parent = {};

    for (let i = 0; i < G.gridX; i++) {
        for (let j = 0; j < G.gridY; j++) {
            distance[new Point(i, j)] = Infinity;
        }
    }


    distance[G.start] = 0;
    let cell = G.start;
    while (!cell.equals(G.goal)) {
        let smallestCell = null;
        for (let i = 0; i < G.gridX; i++) {
            for (let j = 0; j < G.gridY; j++) {
                let currType = G.getCell(new Point(i, j));
                if (currType != CellType.WALL && currType != CellType.VISITED) {
                    if (smallestCell == null || distance[new Point(i, j)] < distance[smallestCell]) {
                        smallestCell = new Point(i, j);
                    }
                }
            }
        }
        if (distance[smallestCell] == Infinity) break;
        cell = smallestCell;

        G.setCell(cell, CellType.VISITED);
        if (cell.equals(G.goal)) break;

        let neighbors = G.neighbors(cell);
        for (let i = 0; i < neighbors.length; i++) {
            let currType = G.getCell(neighbors[i]);
            if (currType != CellType.WALL && currType != CellType.VISITED) {
                let u = cell;
                let v = neighbors[i];
                if (distance[u] + 1 < distance[v]) {
                    distance[v] = distance[u] + 1;
                    parent[v] = u;
                    G.setCell(v, CellType.ACTIVE);
                }
            }
        }
        await sleep(1000 / frameRate());
        if (!config.running) return;
    }
    cell = G.goal;
    while (!cell.equals(G.start)) {
        G.setCell(cell, CellType.PATH);
        cell = parent[cell];
        await sleep(1000 / frameRate());
        if (!config.running) return;
    }
}

async function ASTAR() {
    let distance = {};
    let parent = {};
    let manhattenDistance = {};

    for (let i = 0; i < G.gridX; i++) {
        for (let j = 0; j < G.gridY; j++) {
            distance[new Point(i, j)] = Infinity;
        }
    }
    distance[G.start] = 0;

    for (let i = 0; i < G.gridX; i++) {
        for (let j = 0; j < G.gridY; j++) {
            manhattenDistance[new Point(i, j)] = Infinity;
        }
    }
    manhattenDistance[G.start] = ManDst(G.start);

    let cell = G.start;
    while (!cell.equals(G.goal)) {
        cell = null;
        for (let i = 0; i < G.gridX; i++) {
            for (let j = 0; j < G.gridY; j++) {
                let currType = G.getCell(new Point(i, j));
                if (currType != CellType.WALL && currType != CellType.VISITED) {
                    if (cell == null || manhattenDistance[new Point(i, j)] < manhattenDistance[cell]) {
                        cell = new Point(i, j);
                    }
                }
            }
        }

        G.setCell(cell, CellType.VISITED);
        if (cell.equals(G.goal)) break;

        let neighbors = G.neighbors(cell);
        for (let i = 0; i < neighbors.length; i++) {
            let currType = G.getCell(neighbors[i]);
            if (currType != CellType.WALL && currType != CellType.VISITED) {
                let u = cell;
                let v = neighbors[i];
                if (distance[u] + 1 < distance[v]) {
                    distance[v] = distance[u] + 1;
                    parent[v] = u;
                    manhattenDistance[v] = distance[u] + 1 + ManDst(v);
                    G.setCell(v, CellType.ACTIVE);
                }
            }
        }
        await sleep(1000 / frameRate());
        if (!config.running) return;
    }
    cell = G.goal;
    while (!cell.equals(G.start)) {
        G.setCell(cell, CellType.PATH);
        cell = parent[cell];
        await sleep(1000 / frameRate());
        if (!config.running) return;
    }
}

function ManDst(cell) {
    return Math.abs(G.goal.x - cell.x) + Math.abs(G.goal.y - cell.y);
}

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));