const { compose } = require('ramda');

const SIZE = 22;
const BOMBS = 20;

const BOMB_C = '*';
const CLOSED_C = null;
const EMPTY_C = 0;

const randCoordinate = () => Math.floor(Math.random() * SIZE);
const randCoordinates = () => [randCoordinate(), randCoordinate()];
const emptyField = _ => new Array(SIZE).fill(EMPTY_C).map(_ => new Array(SIZE).fill(EMPTY_C));
const closedField = _ => new Array(SIZE).fill(CLOSED_C).map(_ => new Array(SIZE).fill(CLOSED_C));
const addBombs = field => {
    let bombs = BOMBS;
    while (bombs > 0) {
        const [x,y] = randCoordinates();
        if (field[x][y] === EMPTY_C) {
            field[x][y] = BOMB_C;
            bombs = bombs - 1;
        }
    }
    return field;
}
const makeNeighbours = field => (x,y) => {
    const isSafe = ([x,y]) => [x,y].every(v => v === Math.min(Math.max(v,0), SIZE - 1));
    const isBomb = ([x,y]) => field[x][y] === BOMB_C;
    return [
        [x+1, y], 
        [x, y+1], 
        [x-1, y], 
        [x, y-1], 
        [x+1, y+1], 
        [x-1, y-1], 
        [x+1, y-1], 
        [x-1, y+1]
    ]
    .filter(isSafe)
    .filter(isBomb);
}
const addNumbers = field => {
    const genNeighbours = makeNeighbours(field);
    field.forEach((row, i) => 
        row.forEach((el, j) => {
            if (el === BOMB_C) return;
            let num = 0;
            for(const cord of genNeighbours(i,j)) {
                const [x,y] = cord;
                num = num + 1;
            }
            row[j] = num;
        })
    );
    return field;
}
const makeField = compose(
    addNumbers,
    addBombs,
    emptyField,
);

const logField = field => {
    console.log("-----------------");
    for (let i = 0; i < field.length; i++) {
        let rowStr = "";
        const row = field[i];
        for (j = 0; j < row.length; j++) {
            rowStr += " | " + row[j];
        }
        console.log(rowStr);
    }
    console.log("-----------------");
}
const makeChange = ({x,y,field, oldField}) => {
    oldField[x][y] = field[x][y];
    return {
        changes: [{x,y,value: oldField[x][y]}],
        newField: {...oldField},
    };
}
const getEmptyNeighbours = (x,y,field) => {
    const isSafe = ([x,y]) => [x,y].every(v => v === Math.min(Math.max(v,0), SIZE - 1));
    return [
        [x+1, y], 
        [x, y+1], 
        [x-1, y], 
        [x, y-1], 
        [x+1, y+1], 
        [x-1, y-1], 
        [x+1, y-1], 
        [x-1, y+1]
    ]
    .filter(isSafe)
    .map(([x,y]) => ({x,y}))
    .filter(({x,y}) => field[x][y] === EMPTY_C)
    .reduce((acc, cur) => acc = [...acc, {x:cur.x, y: cur.y}, ...getEmptyNeighbours(cur.x, cur.y, field)], [])
}
const makeStep = ({x,y,field, oldField}) => {
    const v = field[x][y];
    if (v !== EMPTY_C) {
        return makeChange({x,y,field, oldField});
    } else {
        const emptyNeighbours = [{x,y}, ...getEmptyNeighbours(x,y,field)];
        let changes = [];
        let newField = oldField;
        for (col of emptyNeighbours) {
            const change = makeChange(col.x, col.y, field, oldField);
            newField = change.newField;
            chenges = [...changes, ...change.changes].map(({x,y}) => ({x,y,value: EMPTY_C}));
        }
        return {changes, newField};
    }
}

module.exports = {
    makeField,
    closedField,
    makeStep,
};
