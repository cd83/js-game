var world = {
   clockInterval: 1000,
   rollMin: 0,
   rollMax: 100,
   xpLevelUp: 1000,
   tickCount: 0
};

var inBattle = false;
var battleCounter = 0;

var stats = {
	eliteKills: 0,
	kills: 0,
	attacks: 0,
	defended: 0,
	blocks: 0,
	misses: 0,
    crits: 0,
    soulSiphon: 0
};

// our hero
var hero = {
	name: "Foff",
	health: 100,
	level: 1,
	xp: 0,
	crit: 5,
	strength: 0,
	block: 0,
	defense: {
		armor: 0
	},
	offense: {
		weapon: 0
	}
};

var orc = {
	name: "Orc",
	health: 100,
	level: 1,
	crit: 0,
	strength: 0,
	block: 0,
	isElite: false,
	defense: {
		armor: 0
	},
	offense: {
		weapon: 0
	}
}

// the current mob we are battling
var mob = [];

function worldClock() {
   if (hero.health > 0) {
      tickEvent();
   }

   setTimeout(worldClock, world.clockInterval);
}

function tickEvent() {
   // console.log('World Clock Tick...');
   // var rollDice = roll(world.rollMin, world.rollMax);
   // console.log('You shake the dice and cast them on the table...  The roll yields the value', rollDice);
   world.tickCount += 1;

   if (inBattle) {
   	  battleCounter += 1;

      if (battleCounter == 1) {
      	console.log(hero.name + ': ' + 'The hero is engaged in battle with an', mob[0].name);
      	console.log(' ');
      }

      // **************
      // ** ATACK!!
      // **************

      var firstStrike = roll(0, 1);
      if (firstStrike == 0) {
      	// if Zero, our hero get's to attack first this tick
      	mob[0].health -= attack(hero, mob[0]);
      	hero.health -= attack(mob[0], hero);
      } else {
      	hero.health -= attack(mob[0], hero);
      	mob[0].health -= attack(hero, mob[0]);
      }
      console.log(' ');


   } else {
   	  // reset the counters
   	  console.log(hero.name + ': ' + 'Our hero, ' + hero.name + ', is continuing his quest and is out of battle.');
   	  console.log(' ');
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
		console.log(' ');
		console.log('*****************************');
		console.log('****  SOUL SIPHON CAST!  ****')
		console.log('*****************************');
		console.log(' ');
   	  console.log(hero.name + ': ' + 'The soul siphon has been cast to remove 60 health points from our hero but the reward is an additonal Crit point.');
   	  hero.health -= 60;

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
   }

   if (mob.length == 0) {
   	  // the mob is empty, generate a new one
   	  
   	  // reset this value
   	  orc.isElite = false;

   	  mob.push(new spawn(orc));
   	  console.log('********************************************');
   	  console.log('A new enemy has spawned', mob[0]);
   	  console.log('********************************************');
   	  console.log(' ');
   } else {
   	  inBattle = true;

   	   // *********** did the enemy die? **********
	   if (mob[0].health <= 0 && hero.health > 0) {
	   	  stats.kills += 1;

	   	  console.log('****************************************************************************************');
	   	  console.log('****************************************************************************************');
          console.log(' ');
	   	  if (mob[0].isElite == true ) { 
	   	  	stats.eliteKills += 1 
	   	  	console.log(hero.name + ': ' + 'Our hero, ' + hero.name + ', has gained +25 by feasting on the blood of ' + mob[0].name + ' Elite');
		  	hero.health += 25;
	   	  } else { 
	   	  	console.log(hero.name + ': ' + 'Our hero, ' + hero.name + ', has gained +10 by feasting on the blood of ' + mob[0].name);
		  	hero.health += 10;
	   	  }
	   	  console.log(' ');
	   	  console.log(' ');
	   	  console.log('            H    E    R    O          K    I    L    L');
	   	  console.log(' ');
	   	  console.log(' ');
	   	  console.log('Our hero, ' + hero.name + ', killed ' + mob[0].name + '!  Adding to the total body count of ' + stats.kills);
	   	  console.log(' ');
	   	  console.log('****************************************************************************************');
	   	  console.log('****************************************************************************************');

	   	  mob.splice(0, 1);
	   	  inBattle = false;
	   }
   }
}

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
	return enemy 
}

function attack(attacker, defender) {
	var damage = roll(0, 10);
	var defense = roll(0, 10);
	var isCrit = false;

	if (damage == 0) {
		console.log (attacker.name + ': ' + 'The attack by ' + attacker.name + ' missed ' + defender.name);
		if (attacker.name == hero.name) {
			stats.misses += 1;
		}
	} else {
		if (defense > damage) {
			console.log (defender.name + ': ' + 'The attack by ' + attacker.name + ' was defended by ' + defender.name);
			if (attacker.name == hero.name) {
				stats.defended += 1;
			}
		}
	}

	damage = damage - defense;

	if (damage < 0) {
		damage = 0;
	}

	var critMax = 100;

	if (attacker.name != hero.name && attacker.isElite == false) {
		// we will sandbag the attacker if not the hero and not elite
		critMax = 300;
	}

	var crit = roll(0, critMax);
	if (crit >= critMax - attacker.crit) {
		isCrit = true;
		if (attacker.name == hero.name) {
			stats.crits += 1;
		}
	}

	var block =  roll(0, 20);

	if (block == 20) {
		// attack was blocked.
		damage = 0;

		console.log (defender.name + ': ' + 'The attack by ' + attacker.name + ' was blocked by ' + defender.name);
		if (defender.name == hero.name) {
			stats.blocks += 1;
			console.log(hero.name + ': ' + 'Our hero, ' + hero.name + ', has gained +6 health from the blocking the attack on ' + attacker.name);
			hero.health += 6;
		}
	} else {
		// attack was not blocked
		if (isCrit) {
			var critDamage = 0;
			if(attacker.name == hero.name || attacker.isElite) {
				critDamage = roll(10, 30);	
				console.log(hero.name + ': ' + 'Our hero, ' + hero.name + ', has gained +9 health from the CRITICAL STRIKE on ' + defender.name);
				hero.health += 9;
			} else {
				critDamage = roll(5, 14);
			}
		    
			console.log (attacker.name + ': ' + 'CRITICAL STRIKE!! For ' + attacker.name + ' against ' + defender.name);
			damage += critDamage;
		}
	}

	if (damage != 0) {
		console.log (attacker.name + ': ' + 'The attack by ' + attacker.name + ' hit ' + defender.name + ' for +' + damage + ' damage.');
		if (attacker.name == hero.name) {
			stats.attacks += 1;

			if (damage >= 10 && isCrit == false) {
				console.log('Our hero, ' + hero.name + ', has gained +1 health from the hit on ' + defender.name);
				hero.health += 1;
			}
		} 

		if (defender.name == hero.name) {
			var heroHealth = (hero.health - damage);
			if (heroHealth > 0) {
				console.log(hero.name + ' has ' + heroHealth + ' health remaining.');
			}
		}
	}
	return damage;
}
