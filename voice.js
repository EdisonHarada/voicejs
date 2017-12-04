var voicejs = (function () {
	var _speechSynth = window.speechSynthesis;
	var _speechRecog = window.SpeechRecognition || window.webkitSpeechRecognition;

	// Both
	var _lang = "pt-BR";

	// To Speak
	var _speaking = false;
	var _voice = null;
    var _voiceURI = 'native';
    var _volume = 1; // 0 to 1
    var _rate = 1; // 0.1 to 10
    var _pitch = 2; //0 to 2

	// To Listen
	var _listening = false;
	var _continuous = true;
	var _interimResults = true;
	var _listeningCommands = [];

	var _constructor = function(language){
		if(!_speechSynth){
			console.log("Your browser can't talk to you!");   
        }
		if(!_speechRecog){
			console.log("Your browser can't hear you!"); 
        }else{
	    	_speechRecog = new _speechRecog();    
		}

		var voices = window.speechSynthesis.getVoices();
		var voice = voices.find(function(v) { return v.lang == language });
		if(language){
			_voice = voice;
			_lang = voice.lang;
       	}
		else{
			_voice = voices.find(function(v) { return v.lang == _lang })
        }
    }
	
	var _getVoices = function(){
        speechSynthesis.getVoices().forEach(function(voice) {
          console.log(voice.name, voice.default ? voice.default :'');
        });
    }

	var _speak = function(text){
		_speaking = true;

		var synth = new SpeechSynthesisUtterance();
		synth.voice = _voice;
		synth.voiceURI = _voiceURI;
        synth.volume = _volume;
        synth.rate = _rate;
        synth.pitch = _pitch;
        synth.lang = _lang;
        synth.text = text;
		synth.onend = function(){
			_speaking = false;
        }

		_speechSynth.speak(synth);
    }

	var _startListening = function() {
		if(_listening){
			console.log("Already listening!");
			return;
		}
		_listening = true;
		
		_speechRecog.continuos = _continuous;
		_speechRecog.interimResults = _interimResults;
		_speechRecog.lang = _lang;
		
		_speechRecog.onresult = _listeningOnResult;
		_speechRecog.onstart = _listeningOnStart;
		_speechRecog.onerror = _listeningOnError;
		_speechRecog.onend = _listeningOnEnd;
		
		_speechRecog.start();
    }
	
	var _listeningOnResult = function (event) {
		var result = event.results[event.resultIndex];
		var text = result[0].transcript;
		var splitText = text.split(" ").filter(function(f){ return f!= "" }).map(function(m){ return m.toUpperCase() });
		if (!result.isFinal)  return;
		
		var pattern = /[{]{2}[a-zA-Z]+[}]{2}/g;
		
		var startedIndexCommand = -1;
		var firstWordIsParameter = false;
		var command = _listeningCommands.find(function(c) {
			var splitCommand = c.command.trim().split(" ").filter(function(f){ return f!= "" }).map(function(m){ return m.toUpperCase() });
			
			var commandCounter = 0;
			firstWordIsParameter = splitCommand[0].match(pattern) != null;
			startedIndexCommand = -1;
			for(var i = 0; i < splitText.length; i++){
				var commandText = splitCommand[commandCounter];
				var spokenText = splitText[i];
				
				//	Case it's parameter
				if(commandText.match(pattern) != null){
					commandCounter++;
					
					if(splitCommand.length == commandCounter)
						return true;
					
					if(commandCounter > splitCommand.length - 1)
						break;
					else
						continue;
				}
				
				if(commandText.toUpperCase() == spokenText.toUpperCase()){
					commandCounter++;
					
					if(firstWordIsParameter && startedIndexCommand == -1 && i == 0)
						return false;
					else if(firstWordIsParameter && startedIndexCommand == -1)
						startedIndexCommand = i -1;
					else if(startedIndexCommand == -1)
						startedIndexCommand = i;
					
					if(splitCommand.length == commandCounter)
						return true;
					
					if(i - startedIndexCommand + 1 != commandCounter)
						return false;						
				}
			}
			
			return false;
		});
		
		if(command){
			var parameters = command.command.match(pattern);
			var objParameter = {};
			
			if(parameters == null){
				command.callback();
				return;
			}

			command.command.trim().split(" ").filter(function(f){ return f!= "" }).map(function(m){ return m.toUpperCase() }).forEach(function(p, index){
				var parameterName = "";
				
				if(p.match(pattern))
					parameterName = p.replace("{{","").replace("}}","");
				else
					return;
				
				for(var i = startedIndexCommand; splitText.length; i++){
					if(i - startedIndexCommand == index){
						objParameter[parameterName] = splitText[i];
						break;
					}
					
					continue;
				}
			});

			command.callback(objParameter);
		}
		else{
			//	Todo: create callback function
			console.log("Command: ", text, " not found!");
		}
	}	
	var _listeningOnStart = function() { }
	var _listeningOnError = function(event) { }
	var _listeningOnEnd = function() { 
		if(_listening)
			_speechRecog.start();
	}
	
	var _stopListening = function(){
		if(!_listening){
			console.log("Isn't listening!");
			return;
		}
		
		_listening = false;
		_speechRecog.stop();
	}

	return {
		init: _constructor,
		getVoices: _getVoices,
		speak: _speak,
		speaking: () => { return _speaking; },
		
		listening: () => { return _listening; },
		startListening: _startListening,
		stopListening: _stopListening,
		listeningCommands: _listeningCommands
    }
})();