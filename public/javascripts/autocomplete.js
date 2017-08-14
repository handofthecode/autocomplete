
function Autocomplete(input, url) {
  this.input = input
  this.url = url;

  this.listUI = null;
  this.overlay = null;

  this.wrapInput();
  this.createUI();
  this.valueChanged = debounce(this.valueChanged.bind(this), 500);
  
  this.bindEvents();
  this.reset();
}


Autocomplete.prototype.wrapInput = function() {
  var wrapper = document.createElement('div');
  wrapper.classList.add('autocomplete-wrapper');
  this.input.parentNode.appendChild(wrapper);
  wrapper.appendChild(this.input);
}

Autocomplete.prototype.createUI = function() {
  var listUI = document.createElement('ul');
  listUI.classList.add('autocomplete-ui');
  this.input.parentNode.appendChild(listUI);
  this.listUI = listUI;

  var overlay = document.createElement('div');
  overlay.classList.add('autocomplete-overlay');
  overlay.style.width = this.input.clientWidth + 'px';

  this.input.parentNode.appendChild(overlay);
  this.overlay = overlay;
}

Autocomplete.prototype.bindEvents = function() {
  this.input.addEventListener('input', this.valueChanged); // removed bind since already bound
  this.input.addEventListener('keydown', this.handleKeydown.bind(this));
  this.listUI.addEventListener('mousedown', this.handleMousedown.bind(this));
  this.listUI.addEventListener('mouseover', this.handleMouseover.bind(this));
}
Autocomplete.prototype.handleMousedown = function(event) {
  var li = event.target;
  this.input.value = li.innerText;
  this.reset();
}
Autocomplete.prototype.handleMouseover = function(event) {
  var li = event.target;
  var input = this.input.value;
  this.overlay.textContent = input + li.innerText.slice(input.length)
}
Autocomplete.prototype.handleKeydown = function() { 
  switch(event.key) {
    case 'ArrowDown':
      event.preventDefault();
      if (this.selectedIndex === null || this.selectedIndex === this.matches.length - 1) {
        this.selectedIndex = 0;
      } else {
        this.selectedIndex += 1;
      }
      this.bestMatchIndex = null;
      this.draw();
      break;

    case 'ArrowUp':
      event.preventDefault();
      if (this.selectedIndex === null || this.selectedIndex === 0) {
        this.selectedIndex = this.matches.length - 1;
      } else {
        this.selectedIndex -= 1;
      }
      this.bestMatchIndex = null;
      this.draw();
      break;
    case 'Tab':
      event.preventDefault();
      if (this.bestMatchIndex !== null) {
        this.input.value = this.matches[this.bestMatchIndex].name;
      }
      this.reset();
      break;
    case 'Escape':
      this.input.value = this.previousValue;
      this.reset();
      break;
    case 'Enter':
      this.reset();
      break;
  }
}

Autocomplete.prototype.valueChanged = function() {
  var value = this.input.value;
  this.previousValue = value;

  if (value.length > 0) {
    this.fetchMatches(value, function(matches) {
      this.visible = true;
      this.matches = matches;
      this.bestMatchIndex = 0;
      this.selectedIndex = null;
      this.draw();
    }.bind(this));
  } else {
    this.reset();
  }
}

Autocomplete.prototype.fetchMatches = function(query, callback) {
  var request = new XMLHttpRequest();
  
  request.addEventListener('load', function() {
    callback(request.response);
  });  // removed bind

  request.open('GET', this.url + query); // removed encodeURIComponent(query)
  request.responseType = 'json';
  request.send();
}

Autocomplete.prototype.draw = function() {
  var child;
  var selected = this.matches[this.bestMatchIndex];
  while (child = this.listUI.lastChild) {
    this.listUI.removeChild(child);
  }

  if (this.bestMatchIndex === null || selected === undefined || !this.visible) {
    this.overlay.textContent = ''; 
  } else {
    var input = this.input.value;
    this.overlay.textContent = input + selected.name.slice(input.length);
  }

  this.matches.forEach(function(match, index) {
    var li = document.createElement('li');
    li.classList.add('autocomplete-ui-choice');

    if (index === this.selectedIndex) {
      li.classList.add('selected');
      this.input.value = match.name;
    }
    li.textContent = match.name;
    this.listUI.appendChild(li);
  }.bind(this));
}

Autocomplete.prototype.reset = function(query, callback) {
  this.visible = false;
  this.matches = [];
  this.bestMatchIndex = null;
  this.selectedIndex = null;
  this.draw();
}