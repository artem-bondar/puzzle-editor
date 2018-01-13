function handleResize(event) {
    calculateFieldPosition();
    if (field.loaded && field.zoom) {
        calculateZoom();
        changePrimitiveSize(field.primitiveSize);
    }
}

function handleHotkeys(event) {
    switch (event.keyCode) {
        // left/right arrow
        case 37:
        case 39: {
            if (field.loaded) {
                loadTab((event.keyCode == 37) ? 'left' : 'right');
            }
            break;
        }
        // up/down arrows
        case 38:
        case 40: {
            if (field.loaded) {
                var forSelect = undefined;
                var list = document.getElementById("puzzle-list");

                if (puzzleList.length && tabProperties.selectedPuzzle == undefined)
                    forSelect = list.firstChild;
                else {
                    if (event.keyCode == 38) // up
                        forSelect = (tabProperties.selectedPuzzle == list.firstChild) ?
                            list.lastChild : tabProperties.selectedPuzzle.previousSibling;
                    else
                        forSelect = (tabProperties.selectedPuzzle == list.lastChild) ?
                            list.firstChild : tabProperties.selectedPuzzle.nextSibling;
                }

                if (forSelect)
                    selectListItem({ target: forSelect });
            }
            break;
        }
        // del
        case 46:
            {
                if (tabProperties.selectedPuzzle != undefined)
                    deleteListItem({ target: tabProperties.selectedPuzzle.firstChild });
                break;
            }
        default:
            {
                // 0-9 + numpad 0-9
                var number = (event.keyCode >= 48 && event.keyCode <= 57) ? event.keyCode - 48 :
                    (event.keyCode >= 96 && event.keyCode <= 105) ? event.keyCode - 96 : undefined;

                if (number != undefined && number < colors.length && number != field.color) {
                    document.getElementById("color-" + field.color).checked = false;
                    document.getElementById("color-" + number).checked = true;
                    field.color = number;
                }
            }
    }
}

function handleDragOver(event) {
    event.stopPropagation();
    event.preventDefault();
    event.target.style.backgroundColor = 'deepskyblue';
    event.target.style.color = 'white';
    event.dataTransfer.dropEffect = 'copy';
}

function handleDrop(event) {
    event.stopPropagation();
    event.preventDefault();
    handleDragLeave(event);
    loadFiguresFrom(event.dataTransfer.files);
}

function handleDragLeave(event) {
    event.target.style.backgroundColor = 'white';
    event.target.style.color = 'black';
}

function handlePartitioningSwitch() {
    field.partitioning = !field.partitioning;
    if (field.loaded)
        loadFigureBackground(field.figure);
}

function handleZoomSwitch() {
    var slider = document.getElementById('slider-px');
    var indicator = document.getElementById('px-indicator');

    if (document.getElementById('zoom-checkbox').checked) {
        field.zoom = true;
        slider.style.display = "none";
        if (field.loaded)
            setZoomSize();
        else
            indicator.innerHTML = "";
    } else {
        field.zoom = false;
        slider.style.display = "inline-block";
        field.primitiveSize = document.getElementById("range-px").value;
        indicator.innerHTML = field.primitiveSize + "px";
    }

    if (field.loaded)
        changePrimitiveSize(field.primitiveSize);
}

function handleColorPick(event) {
    field.color = event.target.id.slice(6);
}

function handlePaint(event) {
    if (field.partitioning && event.target.style.backgroundColor != colors[field.color]) {
        var coords = IDtoIndex(event.target.id);
        var index = tabProperties.selectedPuzzle.value;

        puzzleList[index].text = changePrimitiveInText(puzzleList[index].text, coords, field.color);
        field.figure.array[coords.i][coords.j] = field.color;
        event.target.style.backgroundColor = colors[field.color];
    }
}
