// ---------------------------------------------------------------------
// Set background image
function setBackground( nb ){
	var root = document.getElementsByTagName('html')[0];
	root.style.backgroundImage = 'url(' + nb + ')';
}
// ---------------------------------------------------------------------
// 
function setPhase( ph ){
	sessionStorage.setItem("phase", ph);
}
function getPhase(){
	return sessionStorage.getItem("phase");
}
function setPNum(ph){
	sessionStorage.setItem("player_number", ph);
}
function getPNum(){
	return Number(sessionStorage.getItem("player_number"));
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
function getStone(){
	return Number(sessionStorage.getItem("stone"));
}
function setStone(np){
	sessionStorage.setItem("stone", np);
}
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
function random(min, max){
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
function removeButton(){
	let old_button = document.getElementById("button");
	if(old_button)
	{
		old_button.parentNode.removeChild(old_button);
	}
}
// ---------------------------------------------------------------------
// Get next player after the one given
function nextPlayer( start ){
	
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
function advancePlayer(astart, asteps) {
	pos = Number(astart);
	steps = Number(asteps);
	
	while(steps > 0)
	{
		pos = nextPlayer(pos);
		--steps;
	}
	
	return pos;
}
// ---------------------------------------------------------------------
// access turn
function getTurn(){
	return Number(sessionStorage.getItem("turn"));
}
function setTurn( nt ){
	sessionStorage.setItem("turn", nt);
}
// ---------------------------------------------------------------------
// subroutine that update the turn
function turnStep(){
	let next_turn = nextPlayer(getTurn());
	
	setTurn(next_turn);
	
	return next_turn;
}
// ---------------------------------------------------------------------
function init(){
	sessionStorage.clear();
	setPNum(0);
	
	addMember();
	addMember();
	addMember();
	addMember();
}
function addMember(){
	
	setPNum(1+getPNum());
	
	let container = document.getElementById("name_container");
	let new_field = document.createElement("input");
	new_field.type = "text";
	new_field.id = "p_text"+getPNum();
	new_field.name = "p_text"+getPNum();
	new_field.value = "";
	
	container.appendChild(new_field);
}
function removeMember(){
	
	if(getPNum() <= 4)
		return;
	
	document.getElementById('p_text'+getPNum()).remove();
	
	setPNum(getPNum()-1);
}

// ---------------------------------------------------------------------
// set game
function start(){
	
	let double = document.getElementById("p_double").checked;
	sessionStorage.setItem("double", double);
	
	// all the players
	for(i=1; i<=getPNum(); i++)
	{
		sessionStorage.setItem("player"+i, document.getElementById("p_text"+i).value);
		sessionStorage.setItem("in"+i, "y");
		sessionStorage.setItem("score"+i, "0");
	}
	
	// assign what player is the fish
	let fish = random(1, getPNum());
	setFish(fish);
	
	// assign what player is the stone
	let stone = -1;
	if(double)
	{
		do{
			stone = random(1,getPNum());
		} while(fish == stone);
	}
	setStone(stone);
	// now choose who now is gonna choose the word
	var chooser = 0;
	do {
		chooser = random(1, getPNum());
	} while( (fish == chooser) || (stone == chooser) );
	
	setChooser(chooser);
	
	console.log("Double: " + double);
	console.log("The chooser is " + chooser);
	console.log("The fish is " + fish);
	console.log("The stone is " + stone);
	
	// The first president is also the first to play
	setTurn(chooser);
	
	// at the start of the game, just do a turn showing each one role
	setPhase("word");
	
	// turn counter
	sessionStorage.setItem("count", "0");
	
	window.location = "pass.html";
}

// ---------------------------------------------------------------------
// Make the one who has the phone in the hand pass it
function passLoaded(){
	if( sessionStorage.getItem("phase") === "score" ||
		sessionStorage.getItem("phase") === "talk" )
		window.location = "play.html";
	
	document.getElementById("title").innerHTML = "Turno di " + sessionStorage.getItem("player" + getTurn());
}

// ---------------------------------------------------------------------
// This organize the play page just after has loaded
function playLoaded(){
	// frequently used stuff
	var phase = getPhase();
	var turn = getTurn();
	var fish = getFish();
	var stone = getStone();
	var double = (stone > 0);
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
			let chosen_word = document.getElementById("word").value;
			
			if(chosen_word != "")
			{
				sessionStorage.setItem("word", chosen_word);
				window.location = "pass.html";
			}
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
			if(double)
			{
				document.getElementById("top_title").innerHTML = "<b>Tu sei il Pesce!</b>";
				document.getElementById("comment").innerHTML = "Il tuo amico Pietra è <font color='blue'>" + sessionStorage.getItem("player" + stone) + "</font>";
			}
			else
			{
				document.getElementById("top_title").innerHTML = "<b>Tu sei il Pesce Pietra!</b>";
				document.getElementById("comment").innerHTML = "Mimetizzati!";
			}
		}
		else if( stone == getTurn() )
		{
			document.getElementById("top_title").innerHTML = "<b>Tu sei la Pietra!</b>";
			document.getElementById("comment").innerHTML = "Il tuo amico Pesce è <font color='blue'>" + sessionStorage.getItem("player" + fish) + "</font>";
		}
		else
		{
			document.getElementById("top_title").innerHTML = "La parola è:";
			document.getElementById("comment").innerHTML = sessionStorage.getItem("word");
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
		
		let starting_player = 0;
		
		do
		{
			starting_player = advancePlayer(getChooser(), random(1,64)+Number(sessionStorage.getItem("count")));
		}
		while (starting_player == getChooser());
		
		console.log("sp: " + starting_player);
		
		let text = "Ora, partendo da <b>" + sessionStorage.getItem("player"+starting_player) + "</b>, Ogni giocatore dirà una parola che abbia correlazione con la parola scelta da " + sessionStorage.getItem("player"+getChooser()) + ". Penserete la parola, poi dovrete dire le parole veloci una dietro l'altra<br>Se sei il pesce pietra, mimetizzati!";
		
		document.getElementById("comment").innerHTML = text;
		
		removeButton();
		
		// callback
		function setButton(button, i)
		{
			button.onclick = function()
			{
				if
				(
					((fish == i) && (!double)) ||
					(double && ( (i == fish && sessionStorage.getItem("in"+stone) == 'n' ) || (i == stone && sessionStorage.getItem("in"+fish) == 'n') ))
				)
				{
					setPhase("fish taken");
					
					// each player (not dead, not the fish, not the stone) gain 1 point
					for(let i=1; i<=player_num; i++)
					{
						if( sessionStorage.getItem("in"+i) != "n" &&
							i != fish &&
							i != stone )
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
					let points = ( 7 / (player_num - (count/1.5)) );
					sessionStorage.setItem("score"+fish, Number(sessionStorage.getItem("score"+fish)) + points);
					
					// give the stone more points
					if(double)
						sessionStorage.setItem("score"+stone, Number(sessionStorage.getItem("score"+stone)) + points);
					
					// remove that player
					sessionStorage.setItem("in"+i, "n");
					
					// if the fish win
					if(Number(sessionStorage.getItem("count")) + 3 == player_num)
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
		let root = document.getElementById("comment").parentNode;
		
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
		if(double)
			document.getElementById("top_title").innerHTML = "IL PESCE E LA PIETRA HANNO VINTO";
		else
			document.getElementById("top_title").innerHTML = "IL PESCE PIETRA HA VINTO";
		document.getElementById("button").value = "Classifica";
		setPhase("score");
	}
	// -----------------------------------------------------------------
	else if(phase === "fish passed")
	{
		if(double)
			document.getElementById("top_title").innerHTML = "IL PESCE E/O LA PIETRA SONO ANCORA IN GIOCO";
		else
			document.getElementById("top_title").innerHTML = "IL PESCE PIETRA L'HA FATTA FRANCA";
		document.getElementById("button").value = "Nuova Parola";
		setPhase("word");
	}
	// -----------------------------------------------------------------
	else if(phase == "fish taken")
	{
		document.getElementById("top_title").innerHTML = "PESCE CATTURATO";
		document.getElementById("button").value = "Classifica";
		setPhase("score");
	}
	// -----------------------------------------------------------------
	else if(phase === "score")
	{
		document.getElementById("top_title").innerHTML = "CLASSIFICA";
		
		let text = '';
		
		if(double)
		{
			text += "<b>" + sessionStorage.getItem("player"+fish) + "</b> era il Pesce!<br>";
			text += "<b>" + sessionStorage.getItem("player"+stone) + "</b> era la Pietra!<br>";
		}
		else
			text += "<b>" + sessionStorage.getItem("player"+fish) + "</b> era il Pesce Pietra!<br>";
		
		text += "<br><br>";
		
		let put = new Array();
		let putn = 0;
		for(let i=1; i<=player_num; i++)
			put[i] = false;
		
		while(putn < player_num)
		{
			let max = -1;
			let maxname = "";
			let maxi = 0;
			
			for(let i=1; i<=player_num; i++)
			{
				if(put[i] == true) continue;
				
				if(Number(sessionStorage.getItem("score"+i)) > max)
				{
					max = Number(sessionStorage.getItem("score"+i));
					maxname = sessionStorage.getItem("player"+i);
					maxi = i;
				}
			}
			
			putn++;
			put[maxi] = true;
			
			if(putn > Math.min(3,player_num-2))
				text += "(" + putn + ") <b>" + maxname + "</b>: " + 10*Number(parseFloat(Number(max).toFixed(1))) + "<br>";
			else
				text += "<font color='green'> (" + putn + ") <b>" + maxname + "</b>: " + 10*Number(parseFloat(Number(max).toFixed(1))) + "</font><br>";
		}
		
		document.getElementById("button").value = "Nuovo Round";
		
		setPhase("word");
		// all the players are in
		for(let i=0; i<=player_num; i++) {
			sessionStorage.setItem("in"+i, "y");
		}
		
		setChooser(nextPlayer( getChooser()));
		setTurn(getChooser());
		sessionStorage.setItem("count", "0");
		
		// set new fish
		let nfish = 0;
		do {
			nfish = random(1, player_num);
		} while( nfish == getChooser() )
		setFish(nfish);
		
		// assign what player is the stone
		let nstone = -1;
		if(double)
		{
			do{
				nstone = random(1,getPNum());
			} while((nfish == nstone) || (nstone == getChooser()));
		}
		setStone(nstone);
		
		console.log("Double: " + double);
		console.log("The chooser is " + getChooser());
		console.log("The fish is " + getFish());
		console.log("The stone is " + getStone());
		
		document.getElementById("comment").innerHTML = text;
	}
	else
	{
		console.log("Unrecognized phase " + phase);
	}
}

// ---------------------------------------------------------------------
// This handle the actions at the end of a turn
function postPlay(){
	// this may be the only thing that actually make sense here?
	if(sessionStorage.getItem("phase") != "end")
		// continue to play
		window.location = "pass.html";
	else
		// start a new game
		window.location = "index.html";
}
