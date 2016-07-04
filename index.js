// todo:
// - function header
// - function soul siphon
// - function game over screen
// - experience process to level up player
// - split out files

var world = require('./engine/world/settings');
world = world.settings;

var inBattle = false;
var battleCounter = 0;

var stats = require('./engine/stats');
stats = stats.settings;

// our hero
var hero = require('./engine/sprites/heroes/foff');
hero = hero.hero;

var orc = require('./engine/sprites/mobs/orc');
orc = orc.orc;

var weapons = require('./engine/objects/weapons/weapons');
weapons = weapons.weapons;

function checkWaveCounter() {
	if (world.waveCounter >= 10) { // this is the number of mobs per wave
		world.wave += 1; // go to next wave
		world.waveCounter = 0; // reset counter to 1
	}
}

var getRandomWeapon = Math.floor(Math.random()*weapons.length);


// the current mob we are battling
var mob = [];

function worldClock() {
   if (hero.health > 0) {
      tickEvent();
   }
   setTimeout(worldClock, world.clockInterval);
}

function tickEvent() {

	checkWaveCounter(); // this runs the check to increase the wave
	world.tickCount += 1;

   if (inBattle) {
   	  battleCounter += 1;

      if (battleCounter == 1) {

      }

      // **************
      // ** ATACK!!
      // **************

	  attack(mob[0], hero)

      console.log(' ');

   } else {
   	  // reset the counters
   	  battleCounter = 0;
   }

   // *********** did our hero die? **********
   if (hero.health <= 0) {
   	  console.log('********************************************');
   	  console.log('Our hero has fallen in battle.');
   	  console.log(hero.name + ' died and his quest is over.');
   	  console.log('Here are the battle stats:', stats);
   	  console.log('world.tickCount: ', world.tickCount)
   	  console.log('********************************************');
   } else if (hero.health >= 150) {
	   castSoulSiphon(hero, stats);
   }

   if (mob.length == 0) {
   	  // the mob is empty, generate a new one

   	  // reset this value
   	  orc.isElite = false;
   	  mob.push(new spawn(orc));

	  console.log(hero.name + "'s stats are:");
	  console.log (hero);
   	  console.log('********************************************');
   	  console.log(' ');
   	  console.log('********************************************');
   	  console.log("A new enemy has spawned...");
	  console.log (mob[0]);
   	  console.log('********************************************');
   	  console.log(' ');
	  console.log("Quest stats: " + stats.kills + " kills, " + stats.crits + " crits." );
	  console.log(' ');
	  console.log("Enemies remaining this wave: " + (10 - world.waveCounter));
	  console.log("Current wave: " + world.wave);
	  console.log(' ');
   } else {
   	  inBattle = true;

   	   // *********** did the enemy die? **********
	   if (mob[0].health <= 0 && hero.health > 0) {
	   	  stats.kills += 1;
		  hero.xp += mob[0].xp; // we add the xp value of the mob to the total xp of the hero
	   	  console.log('Our hero, ' + hero.name + ', killed ' + mob[0].name + '!  Adding to the total body count of ' + stats.kills);
	   	  logHealth(hero.name);
	   	  console.log(' ');

		  world.waveCounter += 1;
	   	  console.log(mob[0].name + ' has been slain!');
		  console.log(' ')

	   	  mob.splice(0, 1);
	   	  inBattle = false;
	   	}
    }
}


// the roll function exists on line 180
// check out the getRandom function on line 177
// not removing because this is being used but one roll() takes in min, max
// the other takes in a stat

function roll(min, max){
   return Math.floor(Math.random() * (max - min + 1) + min); 
}

// initialize the world clock
worldClock();

function spawn(enemy) {
	var eliteRoll = roll(1, 200);
	var eliteMultiplier = 1;

	if (eliteRoll > 182 && world.tickCount > 100) {
		eliteMultiplier = 2;
        //enemy.name += ' Elite';
		console.log(' ');
		console.log('***************************');
		console.log('****  ELITE SPAWNED!!  ****')
		console.log('***************************');
		console.log(' ');
		enemy.isElite = true;
	} else {
		// added because of strange bug
		// variables are leaking. :-(
		enemy.isElite = false;
		//enemy.name = orc.name;
	}
	
	enemy.health = roll(15 * eliteMultiplier, 40 * eliteMultiplier);
	enemy.strength = roll(0, 5 * eliteMultiplier);
	enemy.dodge = roll(0, 5 * eliteMultiplier);
	enemy.crit = roll(1, 8 * eliteMultiplier);
	
	var min = world.wave * 2
	var max = world.wave * 10
	enemy.level = world.wave
	enemy.health = getRandom(min, max*2);
	enemy.initiative = getRandom(min, max);
	enemy.strength = getRandom(min, max);
	enemy.block = getRandom(min, max);
	enemy.dodge = getRandom(min, max);
	enemy.crit = getRandom(min, max);
	enemy.defense.armor = getRandom(min,max);
	enemy.offense.weapon = getRandom(min,max);
	enemy.weapon = weapons[getRandomWeapon];
	var mobXP = getMobXP(); // we use the getMobXP function to calc the xp value of the mob
	enemy.xp = mobXP;
	return enemy 
}

function getRandom(min, max) {
	return Math.floor(Math.random() * (max - min) + min);
}

function roll(stat){
	if ( stat >= getRandom(1,100) ) {
		return true   
	} else {
		return false
	}
}

function attack(attacker, defender) {
	var damage = 0;
	var attackerRoll = getRandom(1, attacker.initiative);
	var defenderRoll = getRandom(1, defender.initiative);
	console.log(attacker.name + "'s roll is: " + attackerRoll )
	console.log(defender.name + "'s roll is: " + defenderRoll )
	if ( attackerRoll > defenderRoll ) { // if attacker rolls higher
		damage = getDamage(attacker,attackerRoll,defender,defenderRoll) // commented out bc function is borked
		if (roll(defender.block)) { // attack was blocked
			damage = 0;
			logDamage(defender,attacker,'block',damage)
		}
		else { // attack was not blocked
			if ( roll(attacker.crit) ) { // check for crit
				logDamage(attacker,defender,'crit',damage)
				increaseStatCount(attacker, "crits")
			}
			else { // no crit
				logDamage(attacker,defender,'hit',damage)
			}
		}
		defender.health -= damage
	}
	else if ( defenderRoll > attackerRoll ) { // if defender rolls higher
		damage = getDamage(defender,defenderRoll,attacker,attackerRoll); // this should work but since it doesn't I'm putting the stuff from inside the function here outside of the function 

		if ( roll(defender.crit) ) { // check for crit
			damage = (damage + defender.crit) * 2
			logDamage(defender,attacker,'crit',damage)
			attacker.health -= damage
			increaseStatCount(defender, "crits")
		} 
		else { // Defender counterattacks
			logDamage(defender,attacker,'hit',damage)
			attacker.health -= damage
		}
	}
	else { //Attacks are even, nothing happens. Log something here later.
		console.log("CLANG!")
	}
}

function logHealth(who) {
	if (who.health > 0 ) {
		console.log( who.name + " has " + who.health + " health remaining." )
	}
}

function increaseStatCount(who, stat) {
	if ( who.name == hero.name ) {
		switch(stat) {
			case 'blocks':
				stats.blocks += 1;
				hero.health += 1;
				console.log(hero.name + "'s health increased by +1 because of the SICK BLOCK.")
				break;
			case 'crits': 
				stats.crits+= 1;
				hero.health += 8;
				console.log(hero.name + "'s health increased by +8! Because he CRIT THAT BEYOTCH.")
				break;
			case 'attacks': stats.attacks += 1;
				break;
			case 'kills': stats.kills += 1; // this isn't actually being tracked here, it's up above where it checks if the mob is dead
			default: return
		}
	} else {
		return
	}
}

function getDamage(whoIsHitting, whoIsHittingRoll, whoIsGettingHit, whoIsGettingHitRoll) {
	var damage = (1 + whoIsHitting.strength + whoIsHitting.offense.weapon + whoIsHittingRoll - whoIsGettingHitRoll - whoIsGettingHit.defense.armor)
	if (damage > 8 && whoIsHitting.name == hero.name) {
		hero.health += 4
		console.log(hero.name + "'s health increased by +4! Due to the BRUTAL attack.")
	}
	if (damage <= 0) {
		damage = 1
	}
	return damage
}

function logDamage(whoIsHitting, whoIsGettingHit, typeOfHit, damage){
	switch(typeOfHit) {
		// block logic is backwards but it's correct...
		case 'block': console.log (whoIsHitting.name + '(' + whoIsHitting.health + ") BLOCKS attack by " + whoIsGettingHit.name + '.');
			break;
		case 'crit': console.log (whoIsHitting.name + '(' + whoIsHitting.health + ") CRITS " + whoIsGettingHit.name + '(' + whoIsGettingHit.health + ') for ' + damage + ' damage with their ' + whoIsHitting.weapon);
			break; 
		case 'hit': console.log (whoIsHitting.name + '(' + whoIsHitting.health + ") hits " + whoIsGettingHit.name + '(' + whoIsGettingHit.health + ') for ' + damage + ' damage with their ' + whoIsHitting.weapon);
			break; 
	}
}

function castSoulSiphon(hero, stats) {
	  console.log(' ');
	  console.log('*****************************');
	  console.log('****  SOUL SIPHON CAST!  ****')
	  console.log('*****************************');
	  console.log(' ');
   	  console.log(hero.name + ': ' + 'The soul siphon has been cast to remove 40 health points from our hero but the reward is an additonal Crit point.');
   	  hero.health -= 40;


   	  if (hero.crit <= 25) {
   	  	 hero.crit +=  1;
   	  } else {
   	  	// crit is too high.  Roll additional life damage.
   	  	var additionalSoulSiphonDamage = roll(5, 12);
   	  	console.log(hero.name + ': ' + 'Soul Siphon has hit +' + additionalSoulSiphonDamage);
   	  	hero.health -= additionalSoulSiphonDamage;
   	  	console.log(hero.name + ' has ' + hero.health + ' health remaining.');
   	  	var critToRemove = roll(5, 12);
   	  	console.log(hero.name + ': ' + 'A lightning strike from the gods has removed +' + critToRemove + ' critical strike points from our hero.');
   	  	hero.crit -= critToRemove;
   	  }
   	  stats.soulSiphon += 1;
   	  console.log('********************************************');
}

// this function calcs xp that the mob grants upon death
function getMobXP() {
	var mobXP = world.wave * ( world.wave * 10)
	return mobXP
}

// this will be the function that has all the logic for leveling up the player
function levelUp() {
	// the calculation is:
	// hero.level * 50 * ( hero.level * 2 )
}
