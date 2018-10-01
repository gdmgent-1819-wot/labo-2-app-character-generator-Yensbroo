// IFFE
(function () {
  // Object Literal Notation
  var app = {

    init: function () {
      console.log('1. Initalize the application');

      firebase.initializeApp(config);

      this.database = firebase.database();

      // Cache DOM-elements
      this.arcadeCharacterElement = document.querySelector('.arcade-character');
      this.generateCharacter = document.querySelector('.generate');
      this.saveCharacter = document.querySelector('.save');
      this.playCharacters = document.querySelector('.play');
      this.patternList = document.querySelector('.pattern-list');

      const self = this;
      // Call createArcadeCharacterMatrix function
      this.acRows = 8;
      this.acCols = 8;
      this.acWidth = 20;
      this.character = '';
      this.generated = false;
      this.looping = false;
      this.createArcadeCharacterMatrix();
      this.getSavedPatterns();
      this.getSelectedPattern();

      //disable save button when there is no character generated
      this.saveCharacter.disabled = true;

      // Call randomArcadeCharacter function on click
      this.generateCharacter.addEventListener('click', function () {
        self.randomArcadeCharacter();
      }, false);

      this.saveCharacter.addEventListener('click', function () {
        self.savePatternToDB(self.character);
      })
    },
    createArcadeCharacterMatrix: function () {
      var tempStr = '',
        top = 0,
        left = 0;

      for (var i = 0; i < this.acRows; i++) {
        for (var j = 0; j < this.acCols; j++) {
          tempStr += `<div class="led led--off" data-row="${i}" data-col="${j}" style="top:${top}px;left:${left}px"></div>`;

          left += this.acWidth;
        }
        top += this.acWidth;
        left = 0;
      }
      this.arcadeCharacterElement.innerHTML = tempStr;
    },
    randomArcadeCharacter: function () {
      var pattern = '';
      for (var i = 0; i < this.acRows; i++) {
        var tempStr = '';
        for (var j = 0; j < Math.ceil(this.acCols / 2); j++) {
          tempStr += Math.round(Math.random());
        }
        var tempStrAsArray = tempStr.split('').reverse();
        if (this.acCols % 2 != 0) {
          tempStrAsArray = tempStrAsArray.slice(1, tempStrAsArray.length);
        }
        tempStr = tempStr + tempStrAsArray.join('');
        pattern += tempStr;
      }

      this.character = pattern;
      this.generated = true;
      this.saveCharacter.disabled = false;
      this.showPattern(pattern);
    },

    getSavedPatterns: function () {
      let tempStr = '';
      self = this;
      let i = 0;
      let characters = [];
      this.database.ref('patterns').on('value', function (snap) {
        tempStr = '';
        i = 0;
        snap.forEach(function (child) {
          characters.push(child.val());
          tempStr += `<option value="${child.val()}">Pattern ${i}</option>`;
          i++;
          self.patternList.innerHTML = '<option disabled selected value> Choose a pattern </option>' + tempStr;
        });
      })

      this.playPatternLoop(characters);
    },

    playPatternLoop: function (pattern) {
      const self = this;
      let loop;
      this.playCharacters.addEventListener('click', function () {
        let j = 0;
        console.log(pattern);
        if (!self.looping) {
          loop = setInterval(() => {
            if (j >= pattern.length) {
              j = 0;
            } else {
              self.showPattern(pattern[j]);
              j++;
            }
          }, 1000);
          self.looping = true;
          self.playCharacters.innerHTML = 'Stop';

        } else {
          clearTimeout(loop);
          self.looping = false;
          self.playCharacters.innerHTML = 'Start';
        }
        console.log(self.looping);
      })
    },

    showPattern: function (pattern) {
      for (var i = 0; i < this.acRows; i++) {
        for (var j = 0; j < this.acCols; j++) {
          var bit = pattern.charAt((i * this.acCols) + j);
          var ledElement = this.arcadeCharacterElement.querySelector(`.led[data-row="${i}"][data-col="${j}"]`);
          if (bit == '1' && ledElement.classList.contains('led--off')) {
            ledElement.classList.remove('led--off');
            ledElement.classList.add('led--on');
          }
          if (bit == '0' && ledElement.classList.contains('led--on')) {
            ledElement.classList.remove('led--on');
            ledElement.classList.add('led--off');
          }
        }
      }
    },

    getSelectedPattern: function () {
      const self = this;
      console.log(this.patternList.value);
      this.patternList.addEventListener('change', function () {
        self.showPattern(self.patternList.value);
      })
    },

    savePatternToDB: function (pattern) {
      this.database.ref().child('patterns').push().set(pattern);
      alert('pattern saved: ' + pattern);
    },


  };
  app.init(); // Call the init() function from the object literal
})();