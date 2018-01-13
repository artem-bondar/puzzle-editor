function loadFiguresFrom(files) {
  var loaded = [];

  for (var i = 0, file; file = files[i]; i++)
    loaded.push(file);

  loaded.sort(function (a, b) {
    if (a.name < b.name) { return -1; }
    if (a.name > b.name) { return 1; }
    return 0;
  });

  for (var i = 0; i < loaded.length; i++)
    readPuzzlesFrom(loaded[i]);
}

function readPuzzlesFrom(file) {
  var reader = new FileReader();
  reader.onload = function () { parsePuzzlesFrom(file, this.result) };
  reader.readAsText(file);
}

function parsePuzzlesFrom(file, content) {
  field.loaded = true;

  var separator = (content[content.indexOf('\n') - 1] == '\r') ? "\r\n\r\n" : "\n\n";
  var puzzles = content.split(separator);

  var maxIndexSize = puzzles.length.toString().length;
  var fileName = file.name.split('.')[0];
  if (fileName.length == 5 && fileName[2] == '-') // XX-YY
    fileName = file.name.slice(0, 2) + " " + file.name.slice(3, 5);

  var amountForLoad = (puzzleList.length + puzzles.length > tabProperties.puzzlesPerTab) ?
    (tabProperties.puzzlesPerTab - puzzleList.length <= 0) ? 0 : tabProperties.puzzlesPerTab - puzzleList.length : puzzles.length;
  var amountBeforeLoad = puzzleList.length;

  for (var i = 0; i < amountForLoad; i++) {
    var puzzleName = getPuzzleName(fileName, i, maxIndexSize);
    puzzleList.push({ name: puzzleName, text: puzzles[i] });
    addListItem(puzzleName, i + amountBeforeLoad);
  }

  for (var i = amountForLoad; i < puzzles.length; i++)
    puzzleList.push({ name: getPuzzleName(fileName, i, maxIndexSize), text: puzzles[i] });
  
  tabProperties.puzzlesOnCurrentTab += amountForLoad;
  
  if (!tabProperties.totalTabs)
    selectListItem({ target: document.getElementById("puzzle-list").firstChild });
  
  updateNavigationBar();
}

function createFigureGrid(width, height) {
  var table = document.getElementById("puzzle-grid");
  var field = "";

  for (var i = 0; i < height; i++) {
    field += "<tr>";
    for (var j = 0; j < width; j++)
      field += "<td class='primitive' id='" + indexToID(i, j) + "' onclick='handlePaint(event)'></td>";
    field += "</tr>";
  }

  table.innerHTML = field;
}

function loadFigure(figure) {
  createFigureGrid(figure.width, figure.height);
  loadFigureBackground(figure);

  field.width = figure.width;
  field.height = figure.height;
  field.figure = figure;

  calculateZoom();
  if (field.zoom)
    setZoomSize();

  var range = document.getElementById("range-px");
  range.max = field.primitiveZoomedSize;

  if (parseInt(range.value) > parseInt(range.value))
    range.value = range.max;
  else if (parseInt(field.primitiveSize) > parseInt(range.max)) {
    field.primitiveSize = range.max;
    document.getElementById('px-indicator').innerHTML = range.max + "px";
  }

  changePrimitiveSize(field.primitiveSize);
}

function loadFigureBackground(figure) {
  for (var i = 0; i < figure.height; i++)
    for (var j = 0; j < figure.width; j++)
      document.getElementById(indexToID(i, j)).style.backgroundColor = (field.partitioning) ?
        colors[figure.array[i][j]] : (figure.array[i][j] != "0") ? "orange" : "0";
}

function addListItem(text, index) {
  var li = document.createElement("li");
  li.innerHTML = text;
  li.value = index;
  li.setAttribute('onclick', 'selectListItem(event);');

  var span = document.createElement("span");
  span.innerHTML = "\u00D7";
  span.className = "close-button";
  span.setAttribute('onclick', 'deleteListItem(event);');

  li.appendChild(span);
  document.getElementById("puzzle-list").appendChild(li);
}

function deleteListItem(event) {
  parent = event.target.parentNode;
  parent.removeChild(event.target);
  puzzleList.splice(parent.value, 1);

  var nextNode = parent.nextSibling;
  while (nextNode) {
    nextNode.value--;
    nextNode = nextNode.nextSibling;
  }

  tabProperties.puzzlesOnCurrentTab--;
  updateNavigationBar();

  if (parent == tabProperties.selectedPuzzle) {
    tabProperties.selectedPuzzle = undefined;
    
    if (parent.nextSibling != null)
      selectListItem({ target: parent.nextSibling });
    else if (parent.previousSibling != null) 
      selectListItem({ target: parent.previousSibling });
    else {
      field.loaded = false;
      document.getElementById("puzzle-grid").innerHTML = "";
    }
  }

  grandparent = parent.parentNode;
  grandparent.removeChild(parent);
}

function selectListItem(event) {
  if (event.target.tagName === "LI" && event.target != tabProperties.selectedPuzzle) {
    if (tabProperties.selectedPuzzle != undefined)
      tabProperties.selectedPuzzle.classList.toggle("checked");
    tabProperties.selectedPuzzle = event.target;
    tabProperties.selectedPuzzle.classList.toggle("checked");
    loadFigure(textToFigure(puzzleList[tabProperties.selectedPuzzle.value].text));
  }
}

function createNewPuzzle() {
  var width = document.getElementById("range-width").value;
  var height = document.getElementById("range-height").value;
  var text = ("0".repeat(width) + "\n").repeat(height).slice(0, -1);
  var name = "[" + width + "x" + height + "]";
  puzzleList.push({ name: name, text: text });

  if (!field.loaded)
    field.loaded = true;

  if (tabProperties.puzzlesOnCurrentTab != tabProperties.puzzlesPerTab) {
    addListItem(name, puzzleList.length - 1);
    tabProperties.puzzlesOnCurrentTab++;
    selectListItem({ target: document.getElementById("puzzle-list").lastChild });
  } else {
    if (!((puzzleList.length - 1) % tabProperties.puzzlesPerTab))
      tabProperties.totalTabs++;
      
    var loadAmount = puzzleList.length - tabProperties.puzzlesPerTab * (tabProperties.totalTabs - 1);
    tabProperties.currentTab = tabProperties.totalTabs;
    tabProperties.puzzlesOnCurrentTab = loadAmount;
    var shift = tabProperties.puzzlesPerTab * (tabProperties.currentTab - 1);

    document.getElementById("puzzle-list").innerHTML = "";
    document.getElementById('tab-indicator').innerHTML = tabProperties.currentTab + " / " + tabProperties.totalTabs;

    for (var i = 0; i < loadAmount; i++)
      addListItem(puzzleList[shift + i].name, shift + i);

    selectListItem({ target: document.getElementById("puzzle-list").lastChild });
  }

  updateNavigationBar();
}

function updateNavigationBar() {
  if (tabProperties.puzzlesOnCurrentTab < tabProperties.puzzlesPerTab &&
    tabProperties.totalTabs > tabProperties.currentTab) {
    var shift = tabProperties.puzzlesPerTab * (tabProperties.currentTab - 1) + tabProperties.puzzlesOnCurrentTab;
    var leftPuzzles = puzzleList.length - shift;
    var loadAmount = tabProperties.puzzlesPerTab - tabProperties.puzzlesOnCurrentTab;
    tabProperties.puzzlesOnCurrentTab += loadAmount;

    if (loadAmount > leftPuzzles)
      loadAmount = leftPuzzles;

    for (var i = 0; i < loadAmount; i++)
      addListItem(puzzleList[shift + i].name, shift + i);
  } else if (!tabProperties.puzzlesOnCurrentTab && tabProperties.currentTab > 1) {
    tabProperties.currentTab--;
    updateNavigationBar();
  }

  tabProperties.totalTabs = Math.floor(puzzleList.length / tabProperties.puzzlesPerTab) +
    (puzzleList.length % tabProperties.puzzlesPerTab > 0);
  document.getElementById('navigation-bar').style.display = (tabProperties.totalTabs > 1) ? "flex" : "none";
  document.getElementById('tab-indicator').innerHTML = tabProperties.currentTab + " / " + tabProperties.totalTabs;
}

function loadTab(direction) {
  var loadAmount = undefined;

  if (direction == "right")
    if (tabProperties.currentTab != tabProperties.totalTabs) {
      tabProperties.currentTab++;
      loadAmount = (tabProperties.currentTab != tabProperties.totalTabs) ?
        tabProperties.puzzlesPerTab : puzzleList.length - tabProperties.puzzlesPerTab * (tabProperties.currentTab - 1);
    } else if (tabProperties.totalTabs != 1) {
      tabProperties.currentTab = 1;
      tabProperties.puzzlesOnCurrentTab = tabProperties.puzzlesPerTab;
      loadAmount = tabProperties.puzzlesPerTab;
    }

  if (direction == "left")
    if (tabProperties.currentTab != 1) {
      tabProperties.currentTab--;
      loadAmount = tabProperties.puzzlesPerTab;
    } else if (tabProperties.totalTabs != 1) {
      tabProperties.currentTab = tabProperties.totalTabs;
      loadAmount = puzzleList.length - tabProperties.puzzlesPerTab * (tabProperties.totalTabs - 1);
    }

  if (loadAmount) {
    tabProperties.puzzlesOnCurrentTab = loadAmount;
    var shift = tabProperties.puzzlesPerTab * (tabProperties.currentTab - 1);
    
    var list = document.getElementById("puzzle-list");
    list.innerHTML = "";
    
    for (var i = 0; i < loadAmount; i++)
      addListItem(puzzleList[shift + i].name, shift + i);
    
    document.getElementById('tab-indicator').innerHTML = tabProperties.currentTab + " / " + tabProperties.totalTabs;
    selectListItem({ target: list.firstChild });
  }
}

function setZoomSize() {
  field.primitiveSize = field.primitiveZoomedSize;
  document.getElementById('px-indicator').innerHTML = field.primitiveZoomedSize + "px";
}

function changePrimitiveSize(size) {
  var tiles = document.getElementsByClassName("primitive");

  for (var i = 0; i < tiles.length; i++) {
    tiles[i].style.width = size + "px";
    tiles[i].style.height = size + "px";
  }
}

function initializeColorPicker() {
  var colorPicker = document.getElementById("color-picker");
  var html = '<label class="color-preview-field">' +
    '<input type="radio" id="color-0" name="color" checked="checked"></input>' +
    '<span class="color-preview"></span></label>';
  
  for (var i = 1; i < colors.length; i++)
    html += '<label class="color-preview-field">' + 
    '<input type="radio" id=\"color-' + i + '\" name="color"></input>' +
    '<span class="color-preview"></span></label>';
  colorPicker.innerHTML = html;

  var icons = document.getElementsByName('color');

  for (var i = 0; i < icons.length; i++) {
    icons[i].nextSibling.style.backgroundColor = colors[icons[i].id.slice(6)];
    icons[i].onclick = handleColorPick;
  }
}
