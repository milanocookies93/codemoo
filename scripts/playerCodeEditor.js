// Generated by CoffeeScript 1.6.2
(function() {
  var _base, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  if ((_ref = (_base = String.prototype).startsWith) == null) {
    _base.startsWith = function(str) {
      return this.lastIndexOf(str, 0) === 0;
    };
  }

  window.EditorManager = (function() {
    /*
        Manages the code editor.
    */
    function EditorManager(editorDivId, editorConfig, codeConfig) {
      this.editorDivId = editorDivId;
      this.editorConfig = editorConfig;
      this.codeConfig = codeConfig;
      this.onEditorClick = __bind(this.onEditorClick, this);
      this.onEditorCursorMove = __bind(this.onEditorCursorMove, this);
      this.moveEditorButtons = __bind(this.moveEditorButtons, this);
      this.scan = __bind(this.scan, this);
      this.onStudentCodeChange = __bind(this.onStudentCodeChange, this);
      this.resetEditor = __bind(this.resetEditor, this);
      this.acelne = null;
      this.poffset = 0;
      this.onStudentCodeChangeCallback = null;
      this.commands = this.editorConfig.commands;
      this.setUpEditor();
      return;
    }

    EditorManager.prototype.getStudentCode = function() {
      return this.editor.getStudentCode();
    };

    EditorManager.prototype.setUpEditor = function() {
      /*
          Builds the HTML for, and sets up the functionality of,
          the player code editor.
      */

      var buttonField, d, editorDiv, soffset, u, x;

      editorDiv = jQuery("#" + this.editorDivId);
      editorDiv.append('<div id="ace-editor"></div>');
      if (this.editorConfig.buttons.length !== 0) {
        buttonField = jQuery('<div>', {
          id: 'buttons'
        });
        if ($.inArray('insertButtons', this.editorConfig.buttons) !== -1) {
          buttonField.append(jQuery('<div>', {
            id: 'insertButtons'
          }).get(0));
        }
        editorDiv.append(buttonField.get(0));
      }
      editorDiv.append('<div id="parameter-pop-up" class="pop-up-container"></div>');
      if ($.inArray('switchUp', this.editorConfig.buttons) !== -1) {
        this.switchUpImg = 'img/ua-usable.png';
      } else {
        this.switchUpImg = 'img/ua.png';
      }
      if ($.inArray('switchDown', this.editorConfig.buttons) !== -1) {
        this.switchDownImg = 'img/da-usable.png';
      } else {
        this.switchDownImg = 'img/da.png';
      }
      if ($.inArray('deleteLine', this.editorConfig.buttons) !== -1) {
        this.deleteImg = 'img/cx-usable.png';
      } else {
        this.deleteImg = 'img/cx.png';
      }
      this.editor = new PlayerCodeEditor('ace-editor', this.commands, this.codeConfig.initial, this.codeConfig.show, this.codeConfig.prefix, this.codeConfig.postfix, this.editorConfig.freeformEditting);
      this.interpreter = new CodeInterpreter(this.commands);
      this.acelne = document.createElement("div");
      x = document.createElement("img");
      $(x).attr({
        "src": "" + this.deleteImg,
        "class": "ace_xbutton"
      });
      u = document.createElement("img");
      $(u).attr({
        "src": "" + this.switchUpImg,
        "class": "ace_uparrow"
      });
      d = document.createElement("img");
      $(d).attr({
        "src": "" + this.switchDownImg,
        "class": "ace_downarrow"
      });
      $(this.acelne).append(u);
      $(this.acelne).append(x);
      $(this.acelne).append(d);
      $(this.acelne).attr({
        "id": "acelne"
      });
      $(this.acelne).css({
        "display": "none"
      });
      $('body').append(this.acelne);
      soffset = function() {
        var t;

        t = $("#acelne").position().top - $(".ace_scrollbar").scrollTop() + this.poffset;
        $("#acelne").css({
          "top": t + "px"
        });
        return this.poffset = $(".ace_scrollbar").scrollTop();
      };
      $(".ace_scrollbar").scroll(function() {
        return soffset();
      });
      this.setUpInsertButtons();
      this.addEventListeners();
      return this.onStudentCodeChange();
    };

    EditorManager.prototype.setUpInsertButtons = function() {
      /*
          Inserts a button for each command of the game to the html field
          with the id of 'insertButtons'.
      */

      var button, buttonField, buttons, codeEditor, command, line, usesRemaining;

      if ($.inArray('insertButtons', this.editorConfig.buttons) === -1) {
        return;
      }
      buttonField = jQuery('#insertButtons');
      buttons = [];
      for (command in this.commands) {
        line = this.editor.createBlankFunctionHeader(command) + ';';
        usesRemaining = this.commands[command]['usesRemaining'];
        codeEditor = this.editor;
        button = jQuery('<button>', {
          id: command,
          value: command,
          text: "" + line + ": " + usesRemaining,
          click: function(e) {
            (codeEditor.button(codeEditor.usesCurrentRow(codeEditor.usesTextDocument(codeEditor.insertLine)))).call(codeEditor, codeEditor.createNamedArguments({
              command: e.currentTarget.value
            }));
            return false;
          }
        });
        buttons.push(button.get(0));
      }
      buttonField.append(buttons);
    };

    EditorManager.prototype.addEventListeners = function() {
      var ed;

      ed = this.editor;
      if ($.inArray('switchUp', this.editorConfig.buttons) !== -1) {
        jQuery('.ace_uparrow').click(ed.button(ed.usesCurrentPosition(ed.switchUp)));
      } else {
        jQuery('.ace_uparrow').click(ed.editor.focus);
      }
      if ($.inArray('switchDown', this.editorConfig.buttons) !== -1) {
        jQuery('.ace_downarrow').click(ed.button(ed.usesCurrentPosition(ed.switchDown)));
      } else {
        jQuery('.ace_downarrow').click(ed.editor.focus);
      }
      if ($.inArray('deleteLine', this.editorConfig.buttons) !== -1) {
        jQuery('.ace_xbutton').click(ed.button(ed.usesTextDocument(ed.usesCurrentRow(ed.deleteLine))));
      } else {
        jQuery('.ace_xbutton').click(ed.editor.focus);
      }
      ed.onChangeListener(this.onStudentCodeChange);
      ed.onClickListener(this.onEditorClick);
      ed.onCursorMoveListener(this.onEditorCursorMove);
    };

    EditorManager.prototype.resetEditor = function() {
      (this.editor.button(this.editor.resetState))();
    };

    EditorManager.prototype.onStudentCodeChangeListener = function(onStudentCodeChangeCallback) {
      this.onStudentCodeChangeCallback = onStudentCodeChangeCallback;
    };

    EditorManager.prototype.onCommandValidation = function(onCommandRemainingValid) {
      this.onCommandRemainingValid = onCommandRemainingValid;
    };

    EditorManager.prototype.onStudentCodeChange = function(changeData) {
      /*
          When the student code changes, run it through the
          interpreter to figure out commands remaining.
      */
      if (this.scanTimer != null) {
        window.clearTimeout(this.scanTimer);
        this.scanTimer = null;
      }
      this.scanTimer = window.setTimeout(this.scan, 500);
      if (this.onStudentCodeChangeCallback != null) {
        this.onStudentCodeChangeCallback(changeData);
      }
    };

    EditorManager.prototype.scan = function() {
      var remaining;

      remaining = this.interpreter.scanText(this.editor.getStudentCode());
      this.UpdateCommandsStatus(remaining);
    };

    EditorManager.prototype.UpdateCommandsStatus = function(remaining) {
      /*
          Updates the number of commands remaining for each command.
      */

      var button, buttonField, command, line, usesRemaining, valid;

      valid = true;
      buttonField = jQuery('#insertButtons');
      for (command in this.commands) {
        button = buttonField.find("#" + command);
        line = this.editor.createBlankFunctionHeader(command);
        usesRemaining = remaining[command];
        if (usesRemaining <= 0) {
          button.attr('disabled', true);
          if (usesRemaining < 0) {
            valid = false;
          }
        } else {
          button.attr('disabled', false);
        }
        button.text("" + line + ": " + usesRemaining);
      }
      if (typeof this.onCommandRemainingValid === "function") {
        this.onCommandRemainingValid(valid);
      }
    };

    EditorManager.prototype.moveEditorButtons = function() {
      var aglh, aglpl, aglw, offset, row;

      row = this.editor.editor.getCursorPosition().row;
      $('.ace_editor').append(this.acelne);
      aglw = $('.ace_gutter-layer').width();
      aglh = $('.ace_gutter-cell').height();
      aglpl = $('.ace_gutter-cell').css("padding-left");
      offset = aglh * row;
      $(this.acelne).css({
        "width": "15px",
        "max-height": aglh * 2.6,
        "z-index": 20,
        "position": "relative",
        "top": offset - 12 - $(".ace_scrollbar").scrollTop() + "px",
        "left": "32px",
        "display": "block"
      });
      this.poffset = $(".ace_scrollbar").scrollTop();
    };

    EditorManager.prototype.onEditorCursorMove = function(cursorEvent) {
      if (this.parameterPopUp === void 0) {
        this.parameterPopUp = jQuery('#parameter-pop-up');
      }
      if (!this.movingButtons) {
        setTimeout(this.moveEditorButtons, 20);
      }
      this.parameterPopUp.hide();
    };

    EditorManager.prototype.onEditorClick = function(inBounds, clickEvent) {
      /*
          When the editor is clicked, we may or may not
          want to pop up a div for students to enter
          parameters into.
          Return true: continue event propogation
          Return false: stop event propogation
      */

      var button, codeParam, command, commandInfo, editorOffset, gutterOffset, i, id, line, manager, numberOfInputs, row, rowLength, _i, _ref1;

      row = clickEvent.$pos.row;
      if (this.parameterPopUp === void 0) {
        this.parameterPopUp = jQuery('#parameter-pop-up');
      }
      if (inBounds) {
        line = clickEvent.editor.getSession().getLine(row);
        rowLength = line.length;
        if (rowLength === 0) {
          this.parameterPopUp.hide();
          return true;
        }
        commandInfo = this.interpreter.scanCommand(line);
        if (commandInfo === null) {
          clickEvent.stopPropagation();
          return false;
        }
        command = commandInfo.command;
        if (command === null) {
          this.parameterPopUp.hide();
          return true;
        }
        numberOfInputs = this.commands[command]['inputs'];
        if (numberOfInputs === 0) {
          this.parameterPopUp.hide();
          return true;
        }
        this.parameterPopUp.empty();
        this.parameterPopUp.append('(');
        for (i = _i = 1; _i <= numberOfInputs; i = _i += 1) {
          id = "" + command + "-parameter-" + i;
          this.parameterPopUp.append("<input id='" + id + "' type='text' size='5' class='pop-up-inside'>");
          codeParam = commandInfo.parameters[i - 1];
          if (codeParam !== "__") {
            jQuery("#" + id).val(codeParam);
          }
          if (i !== numberOfInputs) {
            this.parameterPopUp.append(',');
            jQuery("#" + id).keypress(function(e) {
              if (e.which === 13) {
                setTimeout((function() {
                  jQuery(e.currentTarget).next().focus();
                }), 0);
                return false;
              }
              return true;
            });
          } else {
            manager = this;
            jQuery("#" + id).keypress(function(e) {
              if (e.which === 13) {
                setTimeout((function() {
                  manager.popUpEditLine(row, command);
                }), 0);
                return false;
              }
              return true;
            });
          }
        }
        this.parameterPopUp.append(')');
        button = jQuery('<button>', {
          id: 'editLine',
          text: 'Ok',
          "class": 'pop-up-inside',
          click: this.popUpEditLine.bind(this, row, command)
        });
        this.parameterPopUp.append(button.get(0));
        editorOffset = jQuery('#ace-editor').position();
        gutterOffset = this.editor.editor.renderer.$gutterLayer.gutterWidth + ((_ref1 = this.editor.editor.renderer.$gutterLayer.$padding) != null ? _ref1.left : void 0);
        this.parameterPopUp.css('top', row * 12 + editorOffset.top - 3);
        this.parameterPopUp.css('left', rowLength * 6 + gutterOffset + editorOffset.left);
        this.parameterPopUp.show();
        setTimeout((function() {
          jQuery("#" + command + "-parameter-" + 1).focus();
        }), 0);
        clickEvent.stopPropagation();
        return false;
      } else {
        this.parameterPopUp.hide();
      }
      return true;
    };

    EditorManager.prototype.popUpEditLine = function(row, command) {
      var ed, i, line, _i, _ref1;

      if (this.parameterPopUp === void 0) {
        this.parameterPopUp = jQuery('#parameter-pop-up');
      }
      line = "" + command + "(";
      for (i = _i = 1, _ref1 = this.commands[command]['inputs']; _i <= _ref1; i = _i += 1) {
        line += jQuery("#parameter-pop-up #" + command + "-parameter-" + i).val();
        if (i !== this.commands[command]['inputs']) {
          line += ', ';
        }
      }
      line += ');';
      ed = this.editor;
      (ed.button(ed.usesTextDocument(ed.editLine))).call(ed, ed.createNamedArguments({
        newLine: line,
        editRow: row
      }));
      this.parameterPopUp.hide();
    };

    return EditorManager;

  })();

  window.PlayerCodeEditor = (function() {
    /*
        Creates and provides functionality for an Ace editor representing player's code.
    */
    function PlayerCodeEditor(editorDivId, commands, codeText, wrapCode, codePrefix, codeSuffix, freeEdit) {
      this.editorDivId = editorDivId;
      this.commands = commands;
      this.wrapCode = wrapCode;
      this.codePrefix = codePrefix;
      this.codeSuffix = codeSuffix;
      this.freeEdit = freeEdit;
      this.reIndentCode = __bind(this.reIndentCode, this);
      this.onChange = __bind(this.onChange, this);
      /*
          Sets internal variables, the default text and buttons
          and their event handlers.
      */

      this.editor = ace.edit(this.editorDivId);
      this.editSession = this.editor.getSession();
      this.editSession.setMode('ace/mode/java');
      this.editSession.setUseSoftTabs(true);
      this.editor.setReadOnly(!this.freeEdit);
      if (!this.freeEdit) {
        jQuery("#" + this.editorDivId + " textarea").attr("readonly", "readonly");
      }
      if (this.wrapCode) {
        this.codeText = this.codePrefix + codeText + '\n' + this.codeSuffix;
      } else {
        this.codePrefix = "";
        this.codeSuffix = "";
        this.codeText = codeText;
      }
      this.codePrefixLength = codePrefix.split('\n').length - 1;
      this.codeSuffixLength = codeSuffix.split('\n').length - 1;
      this.enableKeyboardShortcuts();
      this.resetState();
      this.onChangeCallback = null;
      this.editor.on('change', this.onChange);
      this.editor.focus();
    }

    PlayerCodeEditor.prototype.getStudentCode = function() {
      return this.editor.getValue();
    };

    PlayerCodeEditor.prototype.enableKeyboardShortcuts = function() {
      /*
          Not currently enabled as it would be difficult to prevent
          keyboard shortcuts from changing uneditable areas.
      */

    };

    PlayerCodeEditor.prototype.onChangeListener = function(onChangeCallback) {
      this.onChangeCallback = onChangeCallback;
    };

    PlayerCodeEditor.prototype.onChange = function(changeData) {
      if (this.reindentTimer != null) {
        window.clearTimeout(this.reindentTimer);
        this.reindentTimer = null;
      }
      if (!this.reIndenting) {
        window.setTimeout(this.reIndentCode, 500);
      }
      if (this.onChangeCallback !== null) {
        this.onChangeCallback(changeData);
      }
    };

    PlayerCodeEditor.prototype.onClickListener = function(callback) {
      var _this = this;

      this.editor.on('click', (function(clickEvent) {
        var inBounds;

        inBounds = true;
        if (clickEvent.$pos.row < _this.codePrefixLength || clickEvent.$pos.row >= _this.editSession.getLength() - _this.codeSuffixLength) {
          inBounds = false;
        }
        return callback(inBounds, clickEvent);
      }));
    };

    PlayerCodeEditor.prototype.onCursorMoveListener = function(callback) {
      this.editor.on('changeSelection', callback);
    };

    PlayerCodeEditor.prototype.switchUp = function(_arg) {
      var currentColumn, currentRow, maxRow;

      currentRow = _arg.currentRow, currentColumn = _arg.currentColumn;
      maxRow = this.editSession.getLength();
      if (currentRow - 1 < this.codePrefixLength || currentRow >= maxRow - this.codeSuffixLength) {
        return;
      }
      if (currentRow > 0) {
        this.editSession.moveLinesUp(currentRow, currentRow);
        this.editor.gotoLine(currentRow, currentColumn, false);
      }
    };

    PlayerCodeEditor.prototype.switchDown = function(_arg) {
      var currentColumn, currentRow, maxRow;

      currentRow = _arg.currentRow, currentColumn = _arg.currentColumn;
      maxRow = this.editSession.getLength();
      if (currentRow + 1 >= maxRow - this.codeSuffixLength || currentRow < this.codePrefixLength) {
        return;
      }
      if (currentRow < maxRow - 1) {
        this.editSession.moveLinesDown(currentRow, currentRow);
        this.editor.gotoLine(currentRow + 2, currentColumn, false);
      }
    };

    PlayerCodeEditor.prototype.deleteLine = function(_arg) {
      var currentRow, line, maxRow, text;

      text = _arg.text, currentRow = _arg.currentRow;
      maxRow = this.editSession.getLength();
      if (currentRow >= maxRow - this.codeSuffixLength || currentRow < this.codePrefixLength) {
        return;
      }
      line = text.getLine(currentRow);
      if (text.getLength() === 1) {
        text.insertLines(currentRow + 1, ["\n"]);
        text.removeNewLine(currentRow);
      }
      text.removeLines(currentRow, currentRow);
    };

    PlayerCodeEditor.prototype.insertLine = function(_arg) {
      var command, currentRow, maxRow, printLine, text;

      text = _arg.text, command = _arg.command, currentRow = _arg.currentRow;
      maxRow = this.editSession.getLength();
      if (currentRow + 1 < this.codePrefixLength || currentRow + 1 >= maxRow - (this.codeSuffixLength - 1)) {
        return;
      }
      printLine = (this.createBlankFunctionHeader(command)) + ';';
      text.insertLines(currentRow + 1, [printLine]);
      if (text.getLength() === 2 && text.getLine(currentRow) === "") {
        text.removeNewLine(currentRow);
      }
      this.editor.gotoLine(currentRow + 2, 0, false);
    };

    PlayerCodeEditor.prototype.editLine = function(_arg) {
      var editRow, maxRow, newLine, position, text;

      text = _arg.text, editRow = _arg.editRow, newLine = _arg.newLine;
      maxRow = this.editSession.getLength();
      if (editRow + 1 < this.codePrefixLength || editRow + 1 >= maxRow - (this.codeSuffixLength - 1)) {
        return;
      }
      position = this.editor.getCursorPosition();
      text.insertLines(editRow, [newLine]);
      text.removeLines(editRow + 1, editRow + 1);
      this.editor.moveCursorToPosition(position);
    };

    PlayerCodeEditor.prototype.resetState = function() {
      /*
          Resets the text displayed in the editor,
          the commands used counts, and other internal variables.
      */
      this.editor.setValue(this.codeText);
      this.editor.clearSelection();
      this.editor.gotoLine(0, 0, false);
      this.reIndentCode();
    };

    PlayerCodeEditor.prototype.reIndentCode = function() {
      var currentIndent, currentRow, mode, position, text, thisLine, thisLineIndent, _i, _ref1;

      this.reIndenting = true;
      position = this.editor.getCursorPosition();
      text = this.editSession.getDocument();
      mode = this.editSession.getMode();
      for (currentRow = _i = 0, _ref1 = this.editSession.getLength(); _i < _ref1; currentRow = _i += 1) {
        if (currentRow === 0) {
          continue;
        }
        thisLineIndent = mode.getNextLineIndent(this.editSession.getState(currentRow - 1), this.editSession.getLine(currentRow - 1), this.editSession.getTabString());
        thisLine = this.editSession.getLine(currentRow);
        currentIndent = /^\s*/.exec(thisLine)[0];
        if (currentIndent !== thisLineIndent) {
          thisLine = thisLineIndent + thisLine.trim();
        }
        text.insertLines(currentRow, [thisLine]);
        text.removeLines(currentRow + 1, currentRow + 1);
        mode.autoOutdent(this.editSession.getState(currentRow), this.editSession, currentRow);
      }
      this.editor.moveCursorToPosition(position);
      this.editor.clearSelection();
      this.reIndenting = false;
    };

    PlayerCodeEditor.prototype.createBlankFunctionHeader = function(command) {
      /*
          Creates a function header with __ for parameters.
          eg go(__)
      */

      var i, numberOfInputs, underscoresForInputs, _i;

      numberOfInputs = this.commands[command]['inputs'];
      underscoresForInputs = "";
      for (i = _i = 1; _i <= numberOfInputs; i = _i += 1) {
        underscoresForInputs += '__';
        if (i !== numberOfInputs) {
          underscoresForInputs += ', ';
        }
      }
      return "" + command + "(" + underscoresForInputs + ")";
    };

    PlayerCodeEditor.prototype.button = function(func) {
      /*
          This is a wrapper for the functions which are tied to buttons.
          It restores focus to the editor after the button has been pressed.
      */

      var playerCodeEditor;

      playerCodeEditor = this;
      return function() {
        if (arguments.length !== 0 && playerCodeEditor.detectNamedArgument(arguments[0])) {
          func.apply(playerCodeEditor, arguments);
        } else {
          func.call(playerCodeEditor);
        }
        playerCodeEditor.reIndentCode();
        playerCodeEditor.editor.focus();
        return false;
      };
    };

    PlayerCodeEditor.prototype.usesCurrentRow = function(func) {
      /*
          This is a wrapper for the functions which need to know the current row.
          It retrieves the current row and passes it to the function.
      */

      var playerCodeEditor;

      playerCodeEditor = this;
      return function() {
        var currentRow;

        currentRow = playerCodeEditor.editor.getCursorPosition().row;
        this.addNamedArguments(arguments, {
          currentRow: currentRow
        });
        if (arguments.length !== 0 && playerCodeEditor.detectNamedArgument(arguments[0])) {
          func.apply(playerCodeEditor, arguments);
        } else {
          func.call(playerCodeEditor);
        }
        return false;
      };
    };

    PlayerCodeEditor.prototype.usesCurrentPosition = function(func) {
      /*
          This is a wrapper for the functions which need to know the cursor's row and column
          It retrieves the current row and the current column and passes them to the function.
      */

      var playerCodeEditor;

      playerCodeEditor = this;
      return function() {
        var cursorPosition;

        cursorPosition = playerCodeEditor.editor.getCursorPosition();
        this.addNamedArguments(arguments, {
          currentRow: cursorPosition.row,
          currentColumn: cursorPosition.column
        });
        if (arguments.length !== 0 && playerCodeEditor.detectNamedArgument(arguments[0])) {
          func.apply(playerCodeEditor, arguments);
        } else {
          func.call(playerCodeEditor);
        }
        return false;
      };
    };

    PlayerCodeEditor.prototype.usesTextDocument = function(func) {
      /*
          This is a wrapper for functions which edit the text in the editor directly.
          It gets a reference to the text and passes it to the function.
      */

      var playerCodeEditor;

      playerCodeEditor = this;
      return function() {
        var text;

        text = playerCodeEditor.editSession.getDocument();
        this.addNamedArguments(arguments, {
          text: text
        });
        if (arguments.length !== 0 && playerCodeEditor.detectNamedArgument(arguments[0])) {
          func.apply(playerCodeEditor, arguments);
        } else {
          func.call(playerCodeEditor);
        }
        return false;
      };
    };

    PlayerCodeEditor.prototype.addNamedArguments = function(originalArguments, argumentDictionary) {
      /*
          Adds the named arguments to the original arguments.
          Makes changes to originalArguments, returns nothing.
      */

      var argument, argumentFound;

      if (originalArguments.length === 0) {
        originalArguments[originalArguments.length++] = this.createNamedArguments(argumentDictionary);
      } else {
        argumentFound = false;
        for (argument in originalArguments) {
          if (this.detectNamedArgument(originalArguments[argument])) {
            jQuery.extend(true, originalArguments[argument], argumentDictionary);
            argumentFound = true;
            break;
          }
        }
        if (!argumentFound) {
          originalArguments[originalArguments.length++] = this.createNamedArguments(argumentDictionary);
        }
      }
    };

    PlayerCodeEditor.prototype.createNamedArguments = function(argumentDictionary) {
      /*
          Takes in an object of key-value pairs,
          returns an object of the Named Arguments format.
      */
      argumentDictionary['namedArgumentsFlag'] = true;
      return argumentDictionary;
    };

    PlayerCodeEditor.prototype.detectNamedArgument = function(argument) {
      /*
          Returns whether or not the argument is of the namedArguments format.
      */
      if (argument === null) {
        return false;
      }
      if (typeof argument !== 'object') {
        return false;
      }
      if (!('namedArgumentsFlag' in argument)) {
        return false;
      }
      if (argument['namedArgumentsFlag'] !== true) {
        return false;
      }
      return true;
    };

    return PlayerCodeEditor;

  })();

}).call(this);
