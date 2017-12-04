/*
 * breadboardapp by Lazukr.
 * 
 * This is a webapp that is designed to allow users to create breadboard schematics neatly.
 * If you find any bugs, please report at https://github.com/lazukr/breadboardapp
 *
 *
 */ 


// breadboard colors
const BREADBOARD_COLOUR = "#f5d3b3";
const PIN_RED = "#f7786b";
const PIN_BLUE = "#92a8d1";
const PIN_GREEN = "#b1cbbb";

// wire colors
const RED = "#ff0000";
const BLUE = "#0000ff";
const LIME = "#00ff00";
const YELLOW = "#ffff00";
const MAGENTA = "#ff00ff";
const CYAN = "#00ffff";
const BLACK = "#000000";
const WHITE = "#ffffff";
const SILVER = "#c0c0c0";
const GREY = "#808080";
const MAROON = "#800000";
const OLIVE = "#808000";
const GREEN = "#008000";
const PURPLE = "#800080";
const TEAL = "#008080";
const NAVY = "#000080";

class Position {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.serialized = `(${this.x},${this.y})`;
  }

  plus(position) {
    return new Position(this.x + position.x, this.y + position.y);
  }

  times(value) {
    return new Position(this.x * value, this.y * value);
  }
};

class Size {
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }
};

// number of pixels per grid
const SQUARE_SIZE = 10;
const INNER_SQUARE_SCALE  = 0.6;
const INNER_SQUARE_OFFSET = new Position((1 - INNER_SQUARE_SCALE) / 2, (1-INNER_SQUARE_SCALE) / 2);
const UNIT_SQUARE = new Size(1, 1);
const INNER_UNIT_SQUARE = new Size(INNER_SQUARE_SCALE, INNER_SQUARE_SCALE);

// board dimensions
const BOARD_SIZE = new Size(132, 42);
const BOARD_POSITION = new Position(0, 0);

// terminal
const TERMINAL_SIZE = new Size(63, 5);
const TERMINAL_POSITION = new Position(3, 10);
const TERMINAL_OFFSET = new Position(0, 13);

// bus
const BUS_SIZE = new Size(10, 5);
const BUS_PIN_OFFSET = new Position(12, 0);
const BUS_RED_POSITION = new Position(7, 3);
const BUS_RED_OFFSET = new Position(0, 35);
const BUS_BLUE_POSITION = new Position(7, 5);
const BUS_BLUE_OFFSET = new Position(0, 31);

const BUS_STRIP_SIZE = new Size(121, 1);
const BUS_RED_STRIP_POS = new Position(5, 1);
const BUS_BLUE_STRIP_POS = new Position(5, 7);
const BUS_RED_STRIP_OFFSET = new Position(0, 39);
const BUS_BLUE_STRIP_OFFSET = new Position(0, 27);

const BOARD_ID = "BOARD_ID";
const PIN_ID = "PIN";
const PIN_GRID = "PIN_GRID";

class HashMap {
  constructor() {
    this.map = {};
  }

  has(key) {
    return key in this.map;
  }

  get(key) {
    return this.map[key];
  }

  set(key, value) {
    this.map[key] = value;
  }
};

class Display {
  constructor(config) {
    this.name = config.name;
    this.position = config.position;
    this.size = config.size;
    this.colour = config.colour;
    this.serialized = `${this.name}(${this.position.serialized})`;
  }

  toString() {
    return this.serialized;
  }
};

/*
class Wire {
  constructor(config) {
    this.stage = config.stage;
    this.color = config.color;
    this.x = config.x;
    this.y = config.y;
    this.pins = [];
    this.pins.push(config.startingPin);
    this._initWire();
  }

  _initWire() {

    this.display = new createjs.Shape().set({
      x: this.x,
      y: this.y,
      mouseEnabled: false,
      graphics: new createjs.Graphics().beginStroke(this.color).drawCircle(0, 0, 30)
    });
    this.stage.addChild(this.display);
    this.mouseMoveEvent = this.stage.on("stagemousemove", this.drawLine, this);
    this.mouseUpEvent = this.stage.on("stagemouseup", this.endDraw, this);
  }

  drawLine(e, data) {

    let x, y;

    if (data) { 
      x = data.x;
      y = data.y;
    } else {
      x = e.localX;
      y = e.localY;
    }

    this.display.graphics.clear()
      .setStrokeStyle(INNER_SQUARE_SIZE)
      .beginStroke(this.color)
      .moveTo(0,0)
      .lineTo(x - this.display.x, y - this.display.y);
  }

  endDraw(e) {
    let element;
    let elements = this.stage.getObjectsUnderPoint(this.stage.mouseX, this.stage.mouseY);

    for (let i = 0; i < elements.length; i++) {
      if ((elements[i].name === PIN_ID) && (elements[i].pinObject.component == null)) {
        element = elements[i];
        break;               
      }
    }

    if (element != null) {
      this.drawLine(null, {
        x: element.x + SQUARE_SIZE / 2,
        y: element.y + SQUARE_SIZE / 2
      });
      this.pins.push(element.pinObject);
      this.pins.forEach(pin => {
        pin.component = this;
      });
    } else {
      this.stage.removeChild(this.display);
      this.pins = [];
    }
    this.stage.off("stagemousemove", this.mouseMoveEvent);
    this.stage.off("stagemouseup", this.mouseUpEvent);
  }
}
*/
class Pin {
  constructor(config) {
    this.name = PIN_ID;
    this.position = config.position;
    this.colour = config.colour;
    this._initPin();
  }

  _initPin() {
    this.array = new Array();
    this.array.push(new Display({
      name: this.name,
      position: this.position,
      size: UNIT_SQUARE,
      colour: this.colour,
    }));
    
    this.array.push(new Display({
      name: this.name,
      size: INNER_UNIT_SQUARE,
      position: this.position.plus(INNER_SQUARE_OFFSET),
      colour: GREY,
    }));
  }

  *[Symbol.iterator]() {
    for (let i = 0; i < this.array.length; i++) {
      yield this.array[i];
    }
  }
};

class PinArray {
  constructor(config) {
    if (new.target === PinArray) {
      throw TypeError("You cannot call an abstract class");
    }
    this.size = config.size;
    this.position = config.position;
    this.colour = config.colour;
    this._initArray();
  }

  _initArray() {
    const width = this.size.width;
    const height = this.size.height;

    this.array = new Array(width);
    for (let i = 0; i < width; i++) {
      this.array[i] = new Array(height);
      for (let j = 0; j < height; j++) {
        this.array[i][j] = new Pin({
          colour: this.colour,
          position: this.position.plus(this._setPosition(i, j)),
        });
      }
    }
  }

  _setPosition(i, j) {
    return new Position(this.x + i, this.y + j);
  }

  *[Symbol.iterator]() {
    for (let i = 0; i < this.array.length; i++) {
      for (let j = 0; j < this.array[i].length; j++) {
        yield this.array[i][j];
      }
    }
  }
}; 

class Terminal extends PinArray {
  constructor(config) {
    super(config);
  }

  _setPosition(i, j) {
    return new Position(i*2, j*2); 
  }
};

class Bus extends PinArray {
  constructor(config) {
    super(config);
  } 

  _setPosition(i, j) {
    return BUS_PIN_OFFSET.times(i).plus(new Position(j*2, 0));
  }
};

class Board {
  constructor(config) {
    this.position = config.position;
    this.size = config.size;
    this.colour = config.colour;
    this._initAllPins();
  }

  _initAllPins() {
    this.array = new Array();
    this.array.push(new Display({
      name: BOARD_ID,
      position: this.position,
      size: this.size,
      colour: this.colour,
    }));

    for (let i = 0; i < 2; i++) {
      this.array.push(new Terminal({
        size: TERMINAL_SIZE,
        position: TERMINAL_POSITION.plus(TERMINAL_OFFSET.times(i)),
        colour: PIN_GREEN,
      }));

      this.array.push(new Bus({
        size: BUS_SIZE,
        position: BUS_RED_POSITION.plus(BUS_RED_OFFSET.times(i)),
        colour: PIN_RED,
      }));

      this.array.push(new Bus({
        size: BUS_SIZE,
        position: BUS_BLUE_POSITION.plus(BUS_BLUE_OFFSET.times(i)),
        colour: PIN_BLUE,
      }));

      this.array.push(new Display({
        size: BUS_STRIP_SIZE,
        position: BUS_RED_STRIP_POS.plus(BUS_RED_STRIP_OFFSET.times(i)),
        colour: PIN_RED,
      }));

      this.array.push(new Display({
        size: BUS_STRIP_SIZE,
        position: BUS_BLUE_STRIP_POS.plus(BUS_BLUE_STRIP_OFFSET.times(i)),
        colour: PIN_BLUE,
      }));
    }
  }

  *[Symbol.iterator]() {
    for (let i = 0; i < this.array.length; i++) {
      yield this.array[i];
    }
  }
};

class View {
  constructor(config) {
    this.stage = new createjs.Stage('canvas');
    this.gridSize = config.gridSize;
  }

  _drawRect(position, size, colour) {
    const rect = new createjs.Shape();
    rect.graphics
      .beginFill(colour)
      .drawRect(position.x, position.y, size.width, size.height);
    this.stage.addChild(rect);
  }

  _toGridPosition(position) {
    return new Position(position.x*this.gridSize, position.y*this.gridSize);
  }

  _toGridSize(size) {
    return new Size(size.width*this.gridSize, size.height*this.gridSize);
  }

  _renderDisplayable(display) {
    const actualSize = this._toGridSize(display.size);
    const actualPosition = this._toGridPosition(display.position);
    this._drawRect(actualPosition, actualSize, display.colour);
  }

  _renderDisplayCollection(displayCollection) {
    for (let display of displayCollection) {
      this.render(display);
    }
  }

  render(displayObject) {
    if (displayObject instanceof Display) {
      this._renderDisplayable(displayObject);
    }
    
    if ("array" in displayObject) {
      this._renderDisplayCollection(displayObject);
    }
  }

  update() {
    this.stage.update();
  }
}; 

class WebApp {
  constructor(config) {
    this.clear(); 
  }
  
  clear() {
    this.view = new View({
      gridSize: SQUARE_SIZE, 
    });
    this.board = new Board({
      position: BOARD_POSITION,
      size: BOARD_SIZE,
      colour: BREADBOARD_COLOUR, 
    });
  };

  update() {
    this.view.render(this.board);
    this.view.update();
  }
};

function main() {

  const webapp = new WebApp();
  webapp.update();
}
