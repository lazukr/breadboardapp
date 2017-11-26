/*
 * breadboardapp by Lazukr.
 * 
 * This is a webapp that is designed to allow users to create breadboard schematics neatly.
 * If you find any bugs, please report at https://github.com/lazukr/breadboardapp
 *
 *
 */ 


// colors
const BEIGE = "#f5d3b3";
const RED = "#f7786b";
const BLUE = "#92a8d1";
const GREEN = "#b1cbbb";
const DARK_GREY = "#808080";
const ORANGE = "#ff8c00";

// board dimensions
const WIDTH = 132;
const HEIGHT = 42;
const BOARD_POS = {
    x: 0,
    y: 0
};

// number of pixels per grid
const SQUARE_SIZE = 10;

// terminal
const TERMINAL_WIDTH = 63;
const TERMINAL_HEIGHT = 5;
const TERMINAL_OFFSET = {
    x: 0,
    y: 13
};
const TERMINAL_POS = {
    x: 3,
    y: 10
};


// bus
const BUS_WIDTH = 10;
const BUS_HEIGHT = 5;
const BUS_PIN_OFFSET = 12;
const BUS_OFFSETS = {
    red: {
        x: 0,
        y: 35
    },
    blue: {
        x: 0,
        y: 31
    }
};

const BUS_POS = {
    red: {
        x: 7,
        y: 3
    },

    blue: {
        x: 7,
        y: 5
    }
}

const BUS_STRIPS_SIZE = {
    w: 121,
    h: 1
};
const BUS_STRIPS_POS = {
    red: [{x: 5, y: 1}, {x: 5, y: 40}],
    blue: [{x: 5, y:7}, {x: 5, y:34}]
};

const PIN_ID = "PIN";


function main() {

    const board = new Board({
        color: BEIGE,
        width: WIDTH,
        height: HEIGHT
    });
    board.render();

}

function test() {
    console.log("hi");

}

class Wire {
    constructor(config) {
        this.stage = config.stage;
        this.color = config.color;
        this.x = config.x;
        this.y = config.y;
        this.pins = [];
        this.pins.push(config.startingPin);
        this.display = null;
        this.mouseMoveEvent = null;
        this.mouseUpEvent = null;
        this.initWire();
    }

    initWire() {

        this.display = new createjs.Shape().set({
            x: this.x,
            y: this.y,
            mouseEnabled: false,
            graphics: new createjs.Graphics().beginStroke(this.color).drawCircle(0, 0, 50)
        });
        this.stage.addChild(this.display);
        this.mouseMoveEvent = this.stage.on("stagemousemove", this.drawLine, this);
        this.mouseUpEvent = this.stage.on("stagemouseup", this.endDraw, this);
    }

    drawLine(e) {
        this.display.graphics.clear()
            .setStrokeStyle(0.6*SQUARE_SIZE)
            .beginStroke(this.color)
            .moveTo(0,0)
            .lineTo(this.stage.mouseX-this.display.x, this.stage.mouseY-this.display.y);
    }

    endDraw(e) {
        let element, elements = this.stage.getObjectsUnderPoint(this.stage.mouseX, this.stage.mouseY);
        let i;
        
        for (i = 0; i < elements.length; i++) {
            if ((elements[i].name == PIN_ID) && (!elements[i].isOccupied)) {
                element = elements[i];
                break;               
            }
        }

        if (element != null) {
            this.display.graphics.clear()
                .setStrokeStyle(0.6*SQUARE_SIZE)
                .beginStroke(this.color)
                .moveTo(0,0)
                .lineTo(element.x-this.display.x + 0.5*SQUARE_SIZE, element.y-this.display.y + 0.5*SQUARE_SIZE);
            this.pins.push(element.pinObject);
            this.pins.forEach(pin => {
                pin.isOccupied = true;
                pin.occupiedObject = this;
                console.log(pin);   
            });
        } else {
            this.stage.removeChild(this.display);
            this.pins = [];
        }

        this.stage.off("stagemousemove", this.mouseMoveEvent);
        this.stage.off("stagemouseup", this.mouseUpEvent);
    }
}

class Pin {
    constructor(config) {
        this.stage = config.stage;
        this.color = config.color;
        this.x = config.x;
        this.y = config.y;
        this.isOccupied = false;
        this.occupiedObject = null;
    }

    render() {
        const coord = coordToGrid({
            x: this.x,
            y: this.y
        });

        const pin = new createjs.Shape().set({
            x: coord.x,
            y: coord.y,
            cursor: "pointer",
            name: PIN_ID,
            pinObject: this
        });

        const hole = new createjs.Shape().set({
            x: coord.x + 0.2*SQUARE_SIZE,
            y: coord.y + 0.2*SQUARE_SIZE
        });

        drawSquare(this.stage, this.color, pin);
        drawSquare(this.stage, DARK_GREY, hole, 0.6);
        pin.on("mousedown", this.handlePress, this); 
    }

    handlePress(e) {
        console.log("this");
        
        if (!this.isOccupied) {
            const wire = new Wire({
                stage: this.stage,
                color: ORANGE,
                x: e.target.x + 0.5*SQUARE_SIZE,
                y: e.target.y + 0.5*SQUARE_SIZE,
                startingPin: this
            });
        }
    }
};

class TerminalArray {
    constructor(config) {
        this.stage = config.stage;
        this.color = config.color;
        this.x = config.x;
        this.y = config.y;
        this.width = config.width;
        this.height = config.height;
        this.array = null;
        this.initArray();
    }

    initArray() {
        this.array = [];
        let i, j;
        for (i = 0; i < this.width; i++) {
            this.array.push([]);
            for (j = 0; j < this.height; j++) {
                this.array[i].push(new Pin({
                    stage: this.stage,
                    color: this.color,
                    x: this.x + i*2,
                    y: this.y + j*2
                }));
            }
        }
    }

    render() {
        let i, j;
        for (i = 0; i < this.width; i++) {
            for (j = 0; j < this.height; j++) {
                this.array[i][j].render(); 
            }
        }
    }
};

class BusArray {
    
    constructor(config) {
        this.stage = config.stage;
        this.color = config.color;
        this.x = config.x;
        this.y = config.y;
        this.width = config.width;
        this.height = config.height;
        this.array = null;
        this.initArray();
    }

    initArray() {
        this.array = [];
        let i, j;
        for (i = 0; i < this.width; i++) {
            this.array.push([]);
            for (j = 0; j < this.height; j++) {
                this.array[i].push(new Pin({
                    stage: this.stage,
                    color: this.color,
                    x: this.x + j*2 + i*BUS_PIN_OFFSET,
                    y: this.y
                }));
            }
        }
    }

    render() {
        let i, j;
        for (i = 0; i < this.width; i++) {
            for (j = 0; j < this.height; j++) {
                this.array[i][j].render(); 
            }
        }
    }
};


class Board {
    constructor(config) {
        this.stage = new createjs.Stage("canvas");
        this.color = config.color;
        this.size = {
            w: config.width,
            h: config.height
        };
        this.terminalArray = [];
        this.busArray = [];
        this.componentArray = [];
        this.initBoard();
        this.initTerminalArray(GREEN);
        this.initBusArray();
    }

    initBoard() {
        createjs.Ticker.addEventListener("tick", this);        
        this.stage.enableMouseOver();
        
        
    }

    initTerminalArray(color) {
        let i;
        for (i = 0; i < 2; i++) {
            this.terminalArray.push(new TerminalArray({
                stage: this.stage,
                color: color,
                x: TERMINAL_POS.x,
                y: TERMINAL_POS.y + TERMINAL_OFFSET.y*i,
                width: TERMINAL_WIDTH,
                height: TERMINAL_HEIGHT
            }));
        }
    }

    initBusArray() {
        let i;

        for (i = 0; i < 2; i++) {
            
            this.busArray.push(new BusArray({
                stage: this.stage,
                color: RED,
                x: BUS_POS.red.x,
                y: BUS_POS.red.y + BUS_OFFSETS.red.y*i, 
                width: BUS_WIDTH,
                height: BUS_HEIGHT
            }));

            this.busArray.push(new BusArray({
                stage: this.stage,
                color: BLUE,
                x: BUS_POS.blue.x,
                y: BUS_POS.blue.y + BUS_OFFSETS.blue.y*i,
                width: BUS_WIDTH,
                height: BUS_HEIGHT
            }));
        }
    }

    render() {
        const boardPos = coordToGrid(BOARD_POS);
        const boardSize = coordToGrid(this.size);
        const redStripPos = BUS_STRIPS_POS["red"].map(pos => coordToGrid(pos));
        const blueStripPos = BUS_STRIPS_POS["blue"].map(pos => coordToGrid(pos));
        const stripSize = coordToGrid(BUS_STRIPS_SIZE);
        drawRect(this.stage, boardPos, boardSize, this.color);
        redStripPos.forEach(pos => {
            drawRect(this.stage, pos, stripSize, RED);
        });
        blueStripPos.forEach(pos => {
            drawRect(this.stage, pos, stripSize, BLUE);
        });
        this.terminalArray.forEach(array => array.render());
        this.busArray.forEach(array => array.render());
        this.stage.update();
    }

    handleEvent(e) {
        this.stage.update();
    }
};

function drawSquare(stage, color, square, sq_scale=1) {
    square.graphics.beginFill(color)
            .drawRect(0, 0, SQUARE_SIZE*sq_scale, SQUARE_SIZE*sq_scale);
    stage.addChild(square);
}

function drawRect(stage, pos, size, color) {
    const rect = new createjs.Shape();
    rect.graphics.beginFill(color).drawRect(pos.x, pos.y, size.w, size.h);
    stage.addChild(rect);
    stage.update();
}

function coordToGrid(values) {
    Object.keys(values).forEach(key => {
        values[key] = values[key]*SQUARE_SIZE
    });

    return values;
}
