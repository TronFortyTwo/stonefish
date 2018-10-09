// ---------------------------------------------------------------------
// Set background image
function setBackground( nb )
{
	var root = document.getElementsByTagName('html')[0];
	root.style.backgroundImage = 'url(' + nb + ')';
}
// ---------------------------------------------------------------------
// 
function setPhase( ph )
{
	sessionStorage.setItem("phase", ph);
}
function getPhase()
{
	return sessionStorage.getItem("phase");
}
// ---------------------------------------------------------------------
// Extend sessionStorage to store objects
Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
}
Storage.prototype.getObject = function(key) {
    return JSON.parse(this.getItem(key));
}
// ---------------------------------------------------------------------
// abstract stuff
function getFish(){
	return Number(sessionStorage.getItem("fish"));
}
function setFish(np){
	sessionStorage.setItem("fish", np);
}
function setChooser(chooser){
	sessionStorage.setItem("chooser", chooser);
}
function getChooser(){
	return Number(sessionStorage.getItem("chooser"));
}
// ---------------------------------------------------------------------
// Get a random number in a range
function random(min, max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
}
// ---------------------------------------------------------------------
// Shuffle a string
String.prototype.shuffle = function () {
	let a = this.split("");
	let n = a.length;

    for(var i=n-1; i>0; i--)
    {
        let j = Math.floor(Math.random() * (i + 1));
        let tmp = a[i];
        a[i] = a[j];
        a[j] = tmp;
    }
    return a.join("");
}
// ---------------------------------------------------------------------
// subroutine that removes the standard 'Ok, i got it' button
function removeButton()
{
	let old_button = document.getElementById("button");
	if(old_button)
	{
		old_button.parentNode.removeChild(old_button);
	}
}
// ---------------------------------------------------------------------
// Get next player after the one given
function nextPlayer( start )
{
	let next = Number(start);
	let player_num = Number(sessionStorage.getItem("player_number"));
	
	do
	{
		next++;
		if(next > player_num)
			next = 1;
	}
	while( sessionStorage.getItem("in"+next) == "n" );
	
	return next;
}
// ---------------------------------------------------------------------
// access turn
function getTurn()
{
	return Number(sessionStorage.getItem("turn"));
}
function setTurn( nt )
{
	sessionStorage.setItem("turn", nt);
}
// ---------------------------------------------------------------------
// subroutine that update the turn
function turnStep()
{
	let next_turn = nextPlayer(getTurn());
	
	setTurn(next_turn);
	
	return next_turn;
}
// ---------------------------------------------------------------------
// boh
function setPlayerNames()
{
	window.location = "playerSetName.html";
}
// ---------------------------------------------------------------------
// Start a new game
function create( pnum )
{
	sessionStorage.clear();
	
	sessionStorage.setItem("player_number", pnum);
	
	// create all the new players
	setPlayerNames();
}

// ---------------------------------------------------------------------
// Setting the player name
function setName( setnum )
{
	sessionStorage.setItem("player"+setnum, document.getElementById("p_text").value);
	
	if(setnum == sessionStorage.getItem("player_number") ) {
		setGame();
		
		window.location = "pass.html";
		return;
	}
	else
	{
		document.getElementById("p_title").innerHTML = "Giocatore " + (setnum+1) + ":";
		document.getElementById("p_button").onclick = function(){ setName(setnum+1); };
		document.getElementById("p_text").value = "Giocatore " + (setnum+1);
	}
}

// ---------------------------------------------------------------------
// set game
function setGame()
{
	player_num = sessionStorage.getItem("player_number");
	
	// assign what player is the Pesce Pietra
	var fish = random(1, player_num);
	
	setFish(fish);
	
	console.log("The fish is " + fish);
	
	// now choose who now is gonna choose the word
	var chooser = 0;
	do {
		chooser = random(1, player_num);
	} while( fish == chooser );
	
	setChooser(chooser);
	
	console.log("The chooser is " + chooser);
	
	// The first president is also the first to play
	setTurn(chooser);
	
	// at the start of the game, just do a turn showing each one role
	setPhase("word");
	
	// all the players are in
	for(let i=0; i<=player_num; i++)
	{
		sessionStorage.setItem("in"+i, "y");
	}
	
	// score
	for(let i=0; i<=player_num; i++)
	{
		sessionStorage.setItem("score"+i, "0");
	}
	
	// turn counter
	sessionStorage.setItem("count", "0");
}

// ---------------------------------------------------------------------
// Make the one who has the phone in the hand pass it
function passLoaded()
{
	document.getElementById("title").innerHTML = "Turno di " + sessionStorage.getItem("player" + getTurn());
	
	if( sessionStorage.getItem("phase") === "score" ||
		sessionStorage.getItem("phase") === "talk" )
		window.location = "play.html";
}

// ---------------------------------------------------------------------
// This organize the play page just after has loaded
function playLoaded()
{
	// frequently used stuff
	var phase = getPhase();
	var turn = getTurn();
	var fish = getFish();
	var chooser = getChooser();
	var player_num = sessionStorage.getItem("player_number");
	
	// -----------------------------------------------------------------
	// make the chooser choose the word
	if( phase == "word" )
	{
		document.getElementById("top_title").innerHTML = "<b>Devi scegliere la parola</b>";
		
		let root = document.getElementById("button").parentNode;
		removeButton();
		
		let tin = document.createElement("input");
		tin.id = "word";
		tin.type = "text";
		tin.value = "";
		
		let bok = document.createElement("input");
		bok.type = "button";
		bok.value = "OK";
		bok.onclick = function()
		{
			sessionStorage.setItem("word", document.getElementById("word").value);
			window.location = "pass.html";
		};
		
		root.appendChild(tin);
		root.appendChild(bok);
		
		turnStep();
		setPhase("first_round");
	}
	
	// -----------------------------------------------------------------
	// first round just to show roles
	else if( phase === "first_round" )
	{
		if( fish == getTurn() )
		{
			document.getElementById("top_title").innerHTML = "<b>Tu sei il Pesce Pietra!</b>";
		}
		else
		{
			document.getElementById("top_title").innerHTML = "La parola è " + sessionStorage.getItem("word") + "</b>";
		}
		
		turnStep();
		
		if( getTurn() == chooser )
			setPhase("talk");
	}
	// -----------------------------------------------------------------
	// now do the 
	else if( phase === "talk" )
	{
		document.getElementById("top_title").innerHTML = "METTI IL TELEFONO AL CENTRO</b>";
		
		let starting_player = nextPlayer(getChooser() + Number(sessionStorage.getItem("count")));
		
		while( starting_player == getChooser() ) {
			starting_player = nextPlayer(starting_player);
		}
		
		let text = "Ora, partendo da <b>" + sessionStorage.getItem("player"+starting_player) + "</b>, ogni giocatore dirà una parola che abbia correlazione con la parola scelta all'inizio. Avrete un pochino di tempo per pensare alla parola, ma poi le dovrete dire spediti una dietro l'altra<br>";
		text += "esempio: <b>Treno -> Rotaia</b><br>";
		text += "<br>Noti qualcosa di sospetto in qualcuno? Che giocatore è stato scelto?<br>";
		
		let root = document.getElementById("button").parentNode;
		removeButton();
		
		document.getElementById("comment").innerHTML = text;
		
		// callback
		function setButton(button, i)
		{
			button.onclick = function()
			{
				if(fish == i)
				{
					setPhase("fish taken");
					
					// each player (not dead, not the fish) gain 1 point
					for(let i=1; i<=player_num; i++)
					{
						if( sessionStorage.getItem("in"+i) != "n" &&
							i != fish )
						{
							sessionStorage.setItem("score"+i, Number(sessionStorage.getItem("score"+i)) + 1);
						}
					}
				}
				else
				{
					// count update
					let count = Number(sessionStorage.getItem("count"));
					count++;
					sessionStorage.setItem("count", count);
					
					// give the fish more points!
					let points = Number(sessionStorage.getItem("score"+fish)) + ((9/player_num) * Number(sessionStorage.getItem("count")));
					sessionStorage.setItem("score"+fish, points);
					
					// remove that player
					sessionStorage.setItem("in"+i, "n");
					
					// if the fish win
					if(Number(sessionStorage.getItem("count")) + 2 == player_num)
					{
						setPhase("fish win");
					}
					else
					{
						setTurn(getChooser());
						setPhase("fish passed");
					}
				}
				document.location.reload(true);
			}
		}
		
		// create buttons
		for(let i=1; i <= player_num; i++)
		{
			if (i != chooser &&
				sessionStorage.getItem("in"+i) === "y")
			{
				let b = document.createElement("input");
				b.type = "button";
				b.value = sessionStorage.getItem("player"+i);
				setButton(b,i);
			
				root.appendChild(b);
			}
		}
	}
	// -----------------------------------------------------------------
	else if(phase === "fish win")
	{
		document.getElementById("top_title").innerHTML = "IL PESCE HA VINTO";
		document.getElementById("button").value = "Punteggi";
		setPhase("score");
	}
	// -----------------------------------------------------------------
	else if(phase === "fish passed")
	{
		document.getElementById("top_title").innerHTML = "IL PESCE LA HA FATTA FRANCA";
		document.getElementById("button").value = "Continua";
		setPhase("word");
	}
	// -----------------------------------------------------------------
	else if(phase == "fish taken")
	{
		document.getElementById("top_title").innerHTML = "PESCE CATTURATO";
		document.getElementById("button").value = "Punteggi";
		setPhase("score");
	}
	// -----------------------------------------------------------------
	else if(phase === "score")
	{
		document.getElementById("top_title").innerHTML = "PUNTEGGIO";
		
		let text = "<b>" + sessionStorage.getItem("player"+fish) + "</b> era il pesce!<br>";
		text += "<br>PUNTEGGIO:<br>";
		
		for(let i=1; i<=player_num; i++)
		{
			text += "<b>" + sessionStorage.getItem("player"+i) + "</b>: " + Number(parseFloat(Number(sessionStorage.getItem("score"+i)).toFixed(2))) + "<br>";
		}
		
		document.getElementById("button").value = "Incomincia un nuovo round";
		
		setPhase("word");
		setChooser( nextPlayer( getChooser()));
		setTurn(getChooser());
		sessionStorage.setItem("count", "0");
		
		let nfish = 0;
		do { 
			nfish = random(1, player_num);
		} while( nfish == getChooser() )
		setFish(nfish);
		
		// all the players are in
		for(let i=0; i<=player_num; i++) {
			sessionStorage.setItem("in"+i, "y");
		}
		
		document.getElementById("comment").innerHTML = text;
	}
	else
	{
		console.log("Unrecognized phase " + phase);
	}
}

// ---------------------------------------------------------------------
// This handle the actions at the end of a turn
function postPlay()
{
	// this may be the only thing that actually make sense here?
	if(sessionStorage.getItem("phase") != "end")
		// continue to play
		window.location = "pass.html";
	else
		// start a new game
		window.location = "index.html";
}
