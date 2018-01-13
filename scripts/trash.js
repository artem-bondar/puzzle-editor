/* All unused stuff is here */

// Workable functions
function rotateFigure(figure) {
  rotatedArray = [];

  for (var i = 0; i < figure.width; i++) {
    rotatedArray.push([]);
    for (var j = figure.height - 1; j >= 0; j--)
      rotatedArray[i].push(figure.array[j][i]);
  }

  return { width: figure.height, height: figure.width, array: rotatedArray };
}

function setFieldMargin(margin) {
  document.getElementById('puzzle-grid').style.margin = margin + "vw";
}

// Works only when hosted on server
function readTextFile(file) {
  var rawFile = new XMLHttpRequest();
  var result = null;

  rawFile.open("GET", file, false);
  rawFile.onreadystatechange = function () {
      if (this.readyState === 4 && (this.status === 200 || this.status == 0))
          result = this.responseText;
  }
  rawFile.send(null);

  return result;
}

// Raw implementation of border grid editor for puzzle view
function loadShape(figure) {
  createFigureGrid(figure.width, figure.height);

  for (var i = 0; i < figure.height; i++)
    for (var j = 0; j < figure.width; j++)
      if (figure.array[i][j] != '0')
        toggleElementBoarder(document.getElementById(indexToID(i, j)), '5px solid rgb(0, 0, 0)');

  field.width = figure.width;
  field.height = figure.height;
  field.loaded = true;
  calculateZoom();

  changePrimitiveSize(field.primitiveSize);
}

function handleMouseClick(event) {
  changeBorder(event.target, { x: event.pageX, y: event.pageY });
}

function handleTouchStart(event) {
  var touch = event.changedTouches[0];
  changeBorder(touch.target, { x: touch.pageX, y: touch.pageY });
}

function changeBorder(element, eventCoords) {
  var x = (eventCoords.x - field.pageX) % field.size;
  var y = (eventCoords.y - field.pageY) % field.size;
  var position = 2 * (x <= y) ^ (x <= field.size - y);
  
  var positionNames = ['right', 'top', 'bottom', 'left'];
  var style = window.getComputedStyle(element);
  var newBorder = '5px solid rgb(0, 0, 0)';

  if (style.getPropertyValue('border-' + positionNames[position]) != newBorder) {
    element.style['border-' + positionNames[position]] = newBorder;
    changeNeighbour(IDtoIndex(element.id), position, newBorder);
  } else {
    element.style['border-' + positionNames[position]] = '1px solid black';
    changeNeighbour(IDtoIndex(element.id), position, '1px solid black');
  }
}

function changeNeighbour(coords, position, border) {
  var positionReverseNames = ['left', 'bottom', 'top', 'right'];
  var positionNames = ['right', 'top', 'bottom', 'left'];

  switch (positionNames[position]) {
    case 'top': {
      coords.i--;
      if (coords.i >= 0)
        document.getElementById(indexToID(coords.i, coords.j)).style['border-' + positionReverseNames[position]] = border;
      break;
    }
    case 'bottom': {
      coords.i++;
      if (coords.i < field.height)
        document.getElementById(indexToID(coords.i, coords.j)).style['border-' + positionReverseNames[position]] = border;
      break;
    }
    case 'left': {
      coords.j--;
      if (coords.j >= 0)
        document.getElementById(indexToID(coords.i, coords.j)).style['border-' + positionReverseNames[position]] = border;
      break;
    }
    case 'right': {
      coords.j++;
      if (coords.j < field.width)
        document.getElementById(indexToID(coords.i, coords.j)).style['border-' + positionReverseNames[position]] = border;
      break;
    }
  }
}

function checkNeighbour(coords, position, border) {
  var positionNames = ['right', 'top', 'bottom', 'left'];
  var positionReverseNames = ['left', 'bottom', 'top', 'right'];

  switch (positionNames[position]) {
    case 'top': {
      coords.i--;
      if (coords.i >= 0)
        return window.getComputedStyle(document.getElementById(indexToID(coords.i, coords.j))).getPropertyValue('border-' + positionReverseNames[position]) == border;
      break;
    }
    case 'bottom': {
      coords.i++;
      if (coords.i < field.height)
        return window.getComputedStyle(document.getElementById(indexToID(coords.i, coords.j))).getPropertyValue('border-' + positionReverseNames[position]) == border;
      break;
    }
    case 'left': {
      coords.j--;
      if (coords.j >= 0)
        return window.getComputedStyle(document.getElementById(indexToID(coords.i, coords.j))).getPropertyValue('border-' + positionReverseNames[position]) == border;
      break;
    }
    case 'right': {
      coords.j++;
      if (coords.j < field.width)
        return window.getComputedStyle(document.getElementById(indexToID(coords.i, coords.j))).getPropertyValue('border-' + positionReverseNames[position]) == border;
      break;
    }
  }
}

function toggleElementBoarder(element, border) {
  var positionNames = ['right', 'top', 'bottom', 'left'];
  var style = window.getComputedStyle(element);

  for (var i = 0; i < positionNames.length; i++) {
    if (checkNeighbour(IDtoIndex(element.id), i, border)) {
      element.style['border-' + positionNames[i]] = '1px solid black';
      changeNeighbour(IDtoIndex(element.id), i, '1px solid black');
    } else {
      element.style['border-' + positionNames[i]] = border;
      changeNeighbour(IDtoIndex(element.id), i, border);
    }
  }
}
