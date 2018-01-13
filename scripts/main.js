var puzzleList = []; // { name: , text: } 
var colors = ["white", "blue", "green", "yellow", "red",
    "gray", "cyan", "lime", "goldenrod", "tomato"];
var puzzleView = document.getElementById('puzzle-view');
var puzzleGrid = document.getElementById('puzzle-grid');
var tabProperties = {
    puzzlesPerTab: 250,
    totalTabs: 0,
    currentTab: 1,
    // link for list item in navigation bar
    selectedPuzzle: undefined,
    puzzlesOnCurrentTab: 0
};
var field = {
    pageX: undefined,
    pageY: undefined,
    margin: undefined,
    loaded: false,
    color: 0,
    // { width: , height: , array: }
    figure: undefined,
    primitiveSize: 80,
    primitiveZoomedSize: undefined,
    zoom: true,
    partitioning: true,
    // in primitives
    width: undefined,
    height: undefined
};

calculateFieldPosition();
initializeColorPicker();

/* Initialization of events listeners */

// For whole window
window.addEventListener('resize', handleResize);
window.addEventListener('keydown', handleHotkeys);

// For number indicators
document.getElementById("range-px").oninput = function () {
    document.getElementById("px-indicator").innerHTML = this.value + "px";
    field.primitiveSize = this.value;
    if (field.loaded)
        changePrimitiveSize(this.value);
}
document.getElementById("range-width").oninput = function () {
    document.getElementById("width-indicator").innerHTML = this.value + "w";
}
document.getElementById("range-height").oninput = function () {
    document.getElementById("height-indicator").innerHTML = this.value + "h";
}

// For file input field
document.getElementById('file-input').addEventListener('change', function (event) {
    loadFiguresFrom(event.target.files);
    event.target.value = null;
});

// For drag & drop zone
var dropZone = document.getElementById('drop-zone');
dropZone.addEventListener('dragover', handleDragOver);
dropZone.addEventListener('dragleave', handleDragLeave);
dropZone.addEventListener('drop', handleDrop);
