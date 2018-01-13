function indexToID(i, j) {
    return ((i < 10) ? "0" : "") + i +
        ((j < 10) ? "0" : "") + j;
}

function IDtoIndex(id) {
    return { i: parseInt(id.slice(0, 2)), j: parseInt(id.slice(2)) };
}

function getPuzzleName(fileName, puzzleIndex, maxIndexSize) {
    return "[" + fileName + "]" + " " + ("0".repeat(maxIndexSize - puzzleIndex.toString().length) + puzzleIndex);
}

function textToFigure(text) {
    var separator = (text[text.indexOf('\n') - 1] == '\r') ? "\r\n" : "\n";
    var lines = text.split(separator);
    var height = lines.length;
    var array = [];

    for (var i = 0; i < height; i++)
        array.push(lines[i].split(""));

    return { width: array[0].length, height: height, array: array };
}

function changePrimitiveInText(text, coords, newValue) {
    var separator = (text[text.indexOf('\n') - 1] == '\r') ? "\r\n" : "\n";
    var lines = text.split(separator, 1);
    var index = (lines[0].length + separator.length) * coords.i + coords.j;
    var newText = text.substr(0, index) + newValue + text.substr(index + 1);
    return newText;
}

function calculateFieldPosition() {
    field.pageX = puzzleView.offsetLeft;
    field.pageY = puzzleView.offsetTop;
    field.margin = window.getComputedStyle(puzzleGrid).getPropertyValue("margin").slice(0, -2);
}

function calculateZoom() {
    var zoomToWidthSize = Math.round((puzzleView.offsetWidth - 2 * field.margin) / field.width);
    var zoomToHeightSize = Math.round((puzzleView.offsetHeight - 2 * field.margin) / field.height);
    field.primitiveZoomedSize = Math.min(zoomToWidthSize, zoomToHeightSize);
}
