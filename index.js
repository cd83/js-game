var world = {
   clockInterval: 1500,
   rollMin: 0,
   rollMax: 100
};


function worldClock() {
   tickEvent();
   setTimeout(worldClock, world.clockInterval);
}

function tickEvent() {
   console.log('World Clock Tick...');
   var rollDice = roll();
   console.log('You shake the dice and cast them on the table...  The roll yields the value', rollDice);
}

function roll(){
   return Math.floor(Math.random() * (world.rollMax - world.rollMin + 1) + world.rollMin); 
}

worldClock();
