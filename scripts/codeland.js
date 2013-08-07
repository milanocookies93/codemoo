// Generated by CoffeeScript 1.6.2
(function() {
  "use strict";
  var deepcopy, root,
    _this = this;

  root = typeof exports !== "undefined" && exports !== null ? exports : this.codeland = {};

  root.UIcont = null;

  root.initialize = function(UIcont) {
    $('#copyrightinfo').click(function() {
      return window.AboutPage();
    });
    root.gameSelectionScrollPosition = 0;
    root.loadJSONConfigs();
    root.initializeDoppio();
    root.UIcont = UIcont;
  };

  root.initializeDoppio = function() {
    root.doppioReady = false;
    root.doppioPreloaded = false;
    root.doppioAPI = new DoppioApi(null, root.log);
    root.preloadDoppio();
  };

  root.preloadDoppio = function() {
    if (root.doppioPreloaded === false) {
      root.doppioAPI.preload(root.beanshellPreload, root.wrapperCompiled);
      root.doppioPreloaded = true;
    }
  };

  root.wrapperCompiled = function() {
    var player;

    root.doppioReady = true;
    console.log('Finished Preloading Doppio');
    player = root.getPlayer();
    root.drawGameMap(player);
    window.appendBar("#mainbody");
    if (root.wrapperCompiledCallback != null) {
      console.log('Found Callback, running');
      root.wrapperCompiledCallback();
    }
  };

  root.waitForWrapper = function(callback) {
    root.wrapperCompiledCallback = callback;
  };

  root.reference = function() {};

  root.drawGameMap = function(player) {
    var addGameToMap, count, descriptions, game, gameSequence, mapDiv, sel, tmp1, _i, _len;

    descriptions = root.getGameDescriptions();
    mapDiv = $(root.UIcont);
    mapDiv.empty();
    gameSequence = root.getGameSequence();
    sel = new gameSelector(mapDiv, false);
    count = 0;
    addGameToMap = function(game) {
      count = count + 1;
      return sel.buildDiv(count, game, descriptions[game], player.games[game], root.canPlay(game), codeland);
    };
    for (_i = 0, _len = gameSequence.length; _i < _len; _i++) {
      game = gameSequence[_i];
      addGameToMap(game);
    }
    tmp1 = document.getElementById("gameSelection");
    $('<span style="font-size:200%">Choose your Java Game</span><br>').prependTo(tmp1);
    $('<img src="/img/cc0/treasuremap-128px.png">').prependTo(tmp1);
    $('#gameSelection').animate({
      scrollTop: root.gameSelectionScrollPosition
    }, 0);
  };

  root.startGame = function(game) {
    var description, env, found, gamediv, index, quest, tmp1, _i, _len, _ref;

    console.log("Starting " + game);
    _ref = root.quests;
    for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
      quest = _ref[index];
      found = quest.games.indexOf(game);
      if (found !== -1) {
        root.currentQuest = root.quests[index];
        break;
      }
    }
    if (root.currentGame) {
      root.currentGame.finishGame();
    }
    gamediv = $(root.UIcont);
    tmp1 = document.getElementById("gameSelection");
    if (tmp1 !== null) {
      root.gameSelectionScrollPosition = tmp1.scrollTop;
      root.UIcont.removeChild(tmp1);
    }
    description = root.getGameDescriptions()[game];
    env = {
      key: game,
      description: description,
      visualMaster: root.visualMasters[game],
      frameRate: root.visualMasters[game].frameRate,
      gamediv: gamediv,
      player: root.getPlayer(),
      codeland: this,
      backEnd: description.backEnd,
      gameState: description.gameState
    };
    root.currentGame = new GameManager(env);
    root.currentGame.startGame();
  };

  deepcopy = function(src) {
    return $.extend(true, {}, src);
  };

  root.getString = function(key) {
    return localStorage.getItem(key);
  };

  root.setString = function(key, value) {
    return localStorage.setItem(key, value);
  };

  root.clearString = function(key) {
    return localStorage.removeItem(key);
  };

  root.load = function(key) {
    var result, val;

    val = root.getString(key);
    if (val == null) {
      return null;
    }
    result = JSON.parse(val);
    if (result != null) {
      return result;
    }
    throw new Error("Could not parse " + val);
  };

  root.store = function(key, val) {
    if (val == null) {
      throw new Error("Value must exist");
    }
    root.setString(key, JSON.stringify(val));
  };

  root.storeGameCompletionData = function(key, data) {
    if (!((key != null) && (data != null))) {
      throw new Error("Cannot be null");
    }
    root.updatePlayer(function(p) {
      return p.games[key] = data;
    });
  };

  root.showMap = function() {
    if (root.currentGame) {
      root.currentGame.finishGame();
    }
    if (root.wrapperCompiledCallback != null) {
      root.wrapperCompiledCallback = null;
    }
    root.currentGame = null;
    root.drawGameMap(root.getPlayer());
  };

  root.getGame = function() {
    return getPlayer().currentGame;
  };

  root.getPlayer = function() {
    var _ref, _ref1;

    if ((_ref = root.currentPlayer) == null) {
      root.currentPlayer = root.load("CurrentPlayer");
    }
    return (_ref1 = root.currentPlayer) != null ? _ref1 : root.currentPlayer = {
      id: +(new Date()),
      currentGame: '',
      first: '',
      last: '',
      avator: 'generic',
      games: {
        java1a: {
          hiscore: 20,
          stars: 1,
          passed: true
        }
      }
    };
  };

  root.updatePlayer = function(callback) {
    var player;

    player = root.getPlayer();
    callback(player);
    root.store("CurrentPlayer", player);
  };

  root.clearPlayer = function() {
    root.clearString("CurrentPlayer");
  };

  root.readJSON = function(theurl, cb) {
    var exception, fail;

    fail = false;
    console.log("Reading " + theurl);
    try {
      jQuery.ajax({
        dataType: 'json',
        url: theurl,
        async: false,
        error: function() {
          fail = true;
          console.log("Could not read " + theurl);
          cb(void 0);
        },
        success: function(data) {
          cb(data);
        }
      });
    } catch (_error) {
      exception = _error;
      fail = true;
      console.log("" + theurl + ": " + exception + " " + exception.message + " " + exception.stack);
    }
    if (fail) {
      throw "Configuration Exception reading " + theurl;
    }
  };

  root.loadJSONConfigs = function() {
    var configFail;

    if (root.gameDescriptions == null) {
      root.gameDescriptions = {};
    }
    configFail = false;
    root.readJSON('config/config.json', function(data) {
      var quest, questIndex, type, _i, _j, _len, _len1, _ref, _ref1;

      if (data === void 0) {
        configFail = true;
      }
      root.baseDefaults = data.defaults;
      root.gameDefaults = {};
      _ref = data.gameTypes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        type = _ref[_i];
        root.readJSON("config/" + type, function(typeData) {
          if (typeData === void 0) {
            configFail = true;
          }
          root.gameDefaults[typeData.gameType] = typeData;
        });
      }
      root.quests = [];
      root.visualMasters = {};
      root.beanshellPreload = data.beanshellPreload;
      questIndex = 0;
      _ref1 = data.quests;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        quest = _ref1[_j];
        root.readJSON("config/" + quest, function(questData) {
          var game, _k, _len2, _ref2;

          if (questData === void 0) {
            configFail = true;
          }
          root.quests[questIndex++] = questData;
          _ref2 = questData.games;
          for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
            game = _ref2[_k];
            root.readJSON("config/" + game + ".json", function(gameData) {
              var error;

              if (gameData === void 0) {
                configFail = true;
              }
              try {
                root.addToObject(root.baseDefaults, gameData);
                root.addToObject(root.gameDefaults[gameData.gameType].defaults, gameData);
                root.visualMasters[game] = root.gameDefaults[gameData.gameType].visualMaster;
                root.stringifyConfigArrays(gameData);
                root.convertShorthandToCode(gameData);
                root.addHintsToCode(gameData);
                root.gameDescriptions[game] = gameData;
                return;
              } catch (_error) {
                error = _error;
                configFail = true;
                console.log("" + error + " " + error.message + " " + error.stack);
              }
            });
          }
        });
      }
      root.currentQuest = root.quests[0];
    });
    if (configFail) {
      root.gameDescriptions = null;
      throw "Configuration Exception";
    }
  };

  root.addToObject = function(source, destination) {
    var key, value;

    for (key in source) {
      value = source[key];
      if (key in destination) {
        if (typeof value === "object") {
          root.addToObject(value, destination[key]);
        }
      } else {
        destination[key] = value;
      }
    }
  };

  root.stringifyConfigArrays = function(gameData) {
    var _ref, _ref1;

    if ((gameData != null ? (_ref = gameData.game.map) != null ? _ref.join : void 0 : void 0) != null) {
      gameData.game.map = gameData.game.map.join('\n');
    }
    if ((gameData != null ? gameData.code.prefix.join : void 0) != null) {
      gameData.code.prefix = gameData.code.prefix.join('\n');
    }
    if (gameData.code.prefix.charAt(gameData.code.prefix.length - 1) !== '\n') {
      gameData.code.prefix += '\n';
    }
    if ((gameData != null ? gameData.code.postfix.join : void 0) != null) {
      gameData.code.postfix = gameData.code.postfix.join('\n');
    }
    if ((gameData != null ? (_ref1 = gameData.code.initial) != null ? _ref1.join : void 0 : void 0) != null) {
      gameData.code.initial = gameData.code.initial.join('\n');
    }
  };

  root.convertShorthandToCode = function(gameData) {
    var initial, last, re, result, short, shorthand, _i, _len, _ref;

    if (gameData.code.initial != null) {
      return;
    }
    initial = '';
    shorthand = gameData.code.shorthand;
    if (shorthand == null) {
      return;
    }
    while (shorthand !== '') {
      _ref = gameData.code.shorthandKey;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        short = _ref[_i];
        re = new RegExp(short.regex);
        result = re.exec(shorthand);
        if (result !== null) {
          if (initial !== '') {
            last = initial.substring(initial.length - 1);
            if (last === ';') {
              initial += '\n';
            } else if (last !== '\n') {
              initial += '();\n';
            }
          }
          initial += short.repl;
          break;
        }
      }
      if (result === null) {
        result = /\(.*?\)/.exec(shorthand);
        if (result !== null) {
          initial += result[0] + ';';
        }
      }
      if (result !== null) {
        shorthand = shorthand.substring(result[0].length);
      } else {
        shorthand = shorthand.substring(1);
      }
    }
    if (initial !== '' && initial.substring(initial.length - 1) !== ';') {
      initial += '();';
    }
    gameData.code.initial = initial;
  };

  root.addHintsToCode = function(gameData) {
    var one;

    if (gameData.code.comments) {
      one = '// ' + ((gameData.code.comments.join('\n')).replace(/\n/g, '\n// '));
      gameData.code.initial = one + '\n' + (gameData.code.initial != null ? gameData.code.initial : '');
    }
  };

  root.getGameDescriptions = function() {
    if (root.gameDescriptions != null) {
      return root.gameDescriptions;
    }
    root.loadJSONConfigs();
    return root.gameDescriptions;
  };

  root.getGameSequence = function() {
    var addGame, g, games, ignore,
      _this = this;

    if (root.gameSequence) {
      return root.gameSequence;
    }
    root.gameSequence = [];
    games = root.getGameDescriptions();
    addGame = function(name) {
      var doFirst, g, _base, _i, _len, _ref;

      if ($.inArray(name, root.gameSequence) !== -1) {
        return;
      }
      doFirst = (_ref = (_base = games[name]).depends) != null ? _ref : _base.depends = [];
      for (_i = 0, _len = doFirst.length; _i < _len; _i++) {
        g = doFirst[_i];
        addGame(g);
      }
      root.gameSequence.push(name);
    };
    for (g in games) {
      ignore = games[g];
      addGame(g);
    }
    return root.gameSequence;
  };

  root.canPlay = function(game) {
    var depends, g, passCount, player, _i, _len, _ref, _ref1, _ref2;

    player = root.getPlayer();
    if (player != null ? (_ref = player.games[game]) != null ? _ref.passed : void 0 : void 0) {
      return true;
    }
    depends = (_ref1 = root.getGameDescriptions()[game]) != null ? _ref1.depends : void 0;
    if (!depends) {
      return true;
    }
    passCount = 0;
    for (_i = 0, _len = depends.length; _i < _len; _i++) {
      g = depends[_i];
      if (player != null ? (_ref2 = player.games[g]) != null ? _ref2.passed : void 0 : void 0) {
        passCount++;
      }
    }
    return passCount === depends.length;
  };

}).call(this);
