const create2dArray = (rows) => {
    var array = [];

    for (var i = 0; i < rows; i++) {
        array[i] = [];
    }

    return array;
};

const getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};


exports.create2dArray = create2dArray;
exports.getRandomInt = getRandomInt;