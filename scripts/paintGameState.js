// Generated by CoffeeScript 1.6.2
(function() {
  var PaintGameCommands, deepcopy,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  if (typeof deepcopy === "undefined" || deepcopy === null) {
    deepcopy = function(src) {
      return $.extend(true, {}, src);
    };
  }

  window.PaintGameState = (function() {
    var clockHandle;

    clockHandle = null;

    function PaintGameState(gameManager, waitForCode) {
      var character, i, name, temp, _i, _j, _ref, _ref1, _ref2;

      this.gameManager = gameManager;
      this.stopGame = __bind(this.stopGame, this);
      this.gameLost = __bind(this.gameLost, this);
      this.gameWon = __bind(this.gameWon, this);
      this.clock = __bind(this.clock, this);
      this.gameConfig = deepcopy(this.gameManager.config.game);
      this.gameCommands = new PaintGameCommands(this);
      this.visual = this.gameManager.visual;
      this.score = 0;
      this.stars = 0;
      this.tick = 0;
      this.finishedExecuting = false;
      this.startedExecuting = false;
      this.commands = [];
      this.picture = [];
      for (i = _i = 0, _ref = this.gameManager.config.visual.grid.gridY; _i <= _ref; i = _i += 1) {
        temp = [];
        for (i = _j = 0, _ref1 = this.gameManager.config.visual.grid.gridX; _j <= _ref1; i = _j += 1) {
          temp.push(null);
        }
        this.picture.push(temp);
      }
      _ref2 = this.gameConfig.characters;
      for (name in _ref2) {
        character = _ref2[name];
        if (name.indexOf('Boarder') === -1) {
          character.color = character.sprite;
          this.picture[character.x][character.y] = character;
        }
      }
      if (clockHandle != null) {
        clearInterval(clockHandle);
      }
      clockHandle = setInterval(this.clock, 17);
      this.startedGame = waitForCode ? false : true;
      return;
    }

    PaintGameState.prototype.getGameCommands = function() {
      return this.gameCommands;
    };

    PaintGameState.prototype.clock = function() {
      var command;

      if (this.startedGame === true) {
        if (this.tick % 30 === 0) {
          this.checkEvents();
          if (this.commands.length > 0) {
            command = this.commands.splice(0, 1)[0];
            command.exec();
          } else {
            this.finishedExecuting = this.startedExecuting;
          }
        }
      }
      this.visual.getFrame(this.gameManager.config.visual, this.tick);
      this.tick++;
    };

    PaintGameState.prototype.checkEvents = function() {
      var name, pixel, won, _ref, _ref1;

      if (this.finishedExecuting) {
        won = true;
        _ref = this.gameConfig.characters;
        for (name in _ref) {
          pixel = _ref[name];
          if (pixel.match == null) {
            continue;
          }
          if (pixel.match !== ((_ref1 = this.picture[pixel.x][pixel.y]) != null ? _ref1.color : void 0)) {
            won = false;
          }
        }
        if (won) {
          this.gameWon();
        } else {
          this.gameLost();
        }
      }
    };

    PaintGameState.prototype.start = function() {
      this.startedExecuting = true;
      this.startedGame = true;
    };

    PaintGameState.prototype.drawPixel = function(x, y, color) {
      var char;

      if (!this.gameManager.config.game.characterBase.hasOwnProperty(color)) {
        return;
      }
      char = this.gameManager.generateCharacter(color, x, y, false);
      char.color = color;
      this.picture[x][y] = char;
      this.commands.push({
        key: 'drawPixel',
        exec: this._drawPixel.bind(this, x, y, color, char)
      });
    };

    PaintGameState.prototype._drawPixel = function(x, y, color, char) {
      if (this.picture[x][y] != null) {
        this.visual.removeCharacter(this.gameManager.config.visual, this.picture[x][y].visual);
      }
      this.visual.pushCharacter(this.gameManager.config.visual, char.visual);
      this.picture[x][y] = char;
    };

    PaintGameState.prototype.getPixel = function(x, y) {
      if (this.picture[x][y]) {
        return this.picture[x][y].color;
      } else {
        return "white";
      }
    };

    PaintGameState.prototype.gameWon = function() {
      var codeland, gameIndex, gameName, messages, questIndex;

      if (!this.startedGame) {
        return;
      }
      playAudio('victory.ogg');
      this.stars += 1;
      this.score += 5;
      this.startedGame = false;
      this.gameManager.gameWon(this.score, this.stars);
      gameName = this.gameManager.gameName();
      codeland = this.gameManager.environment.codeland;
      gameIndex = codeland.currentQuest.games.indexOf(gameName);
      questIndex = codeland.quests.indexOf(codeland.currentQuest);
      if (++gameIndex === codeland.currentQuest.games.length) {
        questIndex = ++questIndex % codeland.quests.length;
        gameIndex = 0;
      }
      gameName = codeland.quests[questIndex].games[gameIndex];
      messages = [];
      messages[0] = 'Congratulations!';
      window.objCloud(400, messages, "body", "30%", "30%", 1.5, gameName, this.gameManager);
      this.gameManager.gameRunFinished();
    };

    PaintGameState.prototype.gameLost = function() {
      var messages;

      if (!this.startedGame) {
        return;
      }
      if (clockHandle != null) {
        clearInterval(clockHandle);
      }
      this.startedGame = false;
      playAudio('defeat.ogg');
      messages = [];
      messages[0] = "Try Again!";
      window.objCloud(400, messages, "body", "30%", "30%", 3, "none", this.gameManager);
      clockHandle = setInterval(this.clock, 17);
      this.gameManager.gameRunFinished();
    };

    PaintGameState.prototype.stopGame = function() {
      if (clockHandle != null) {
        clearInterval(clockHandle);
      }
      this.startedGame = false;
    };

    return PaintGameState;

  })();

  PaintGameCommands = (function() {
    function PaintGameCommands(gameState) {
      this.gameState = gameState;
      return;
    }

    PaintGameCommands.prototype.finishedParsingStartGame = function() {
      this.gameState.start();
    };

    PaintGameCommands.prototype.drawPixel = function(x, y, color) {
      this.gameState.drawPixel(x, y, color);
    };

    PaintGameCommands.prototype.getPixel = function(x, y) {
      return this.gameState.getPixel(x, y);
    };

    return PaintGameCommands;

  })();

}).call(this);
