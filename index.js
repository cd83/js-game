var world = {
   clockInterval: 2000,
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
	strength: 10,
	block: 50,
	initiative: 10,
	defense: {
		armor: 10
	},
	weapon: "Totally Rad Sword",
	offense: {
		weapon: 10
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
	initiative: 0,
	dodge: 0,
	defense: {
		armor: 0
	},
	weapon: '',
	offense: {
		weapon: 0
	}
}

var weapons = [
    'sword',
    'axe',
	'spiked club'
];

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
   world.tickCount += 1;

   if (inBattle) {
   	  battleCounter += 1;

      if (battleCounter == 1) {
		  // console.log('********************************************');
		  // console.log(hero.name + "'s stats are:");
		  // console.log (hero);
		  // console.log("Quest stats:")
		  // console.log(stats)
	   // 	  console.log('********************************************');
	   // 	  console.log(' ');
		  // console.log('An ' + mob[0].name + " attacks from the shadows!" );
	   // 	  console.log('********************************************');
	   // 	  console.log("Enemy stats:");
		  // console.log (mob[0]);
	   // 	  console.log('********************************************');
	   // 	  console.log(' ');
      }

      // **************
      // ** ATACK!!
      // **************

	  attack(mob[0], hero)

   } else {
   	  // reset the counters
   	  // console.log(hero.name + ': ' + 'Our hero, ' + hero.name + ', is continuing his quest and is out of battle.');
   	  // console.log(' ');
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
   	  console.log('********************************************');
   }

   if (mob.length == 0) {
   	  // the mob is empty, generate a new one
   	  
   	  // reset this value
   	  orc.isElite = false;

   	  mob.push(new spawn(orc));
	  console.log(hero.name + "'s stats are:");
	  console.log (hero);
	  console.log("Quest stats:")
	  console.log(stats)
   	  console.log('********************************************');
   	  console.log(' ');
   	  console.log('********************************************');
   	  console.log("A new enemy has spawned...");
	  console.log (mob[0]);
   	  console.log('********************************************');
   	  console.log(' ');
   } else {
   	  inBattle = true;

   	   // *********** did the enemy die? **********
	   if (mob[0].health <= 0 && hero.health > 0) {
	   	  stats.kills += 1;

	   	  if (mob[0].isElite == true ) { 
	   	  	stats.eliteKills += 1 
	   	  	//console.log(hero.name + ': ' + 'Our hero, ' + hero.name + ', has gained +25 by feasting on the blood of ' + mob[0].name + ' Elite');
		  	
		  	// hero.health += 25;
	   	  } else { 
	   	  	//console.log(hero.name + ': ' + 'Our hero, ' + hero.name + ', has gained +10 by feasting on the blood of ' + mob[0].name);
		  	// hero.health += 10;  	
	   	  }

	   	  console.log('Our hero, ' + hero.name + ', killed ' + mob[0].name + '!  Adding to the total body count of ' + stats.kills);
	   	  logHealth(hero.name);
	   	  console.log(' ');

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

// initialize the world clock
worldClock();

function spawn(enemy) {
	enemy.health = getRandom(10, 35);
	enemy.initiative = getRandom(1, 10);
	enemy.strength = getRandom(2, 10);
	enemy.dodge = getRandom(2, 8);
	enemy.crit = getRandom(2, 8);
	enemy.defense.armor = getRandom(2,8);
	enemy.offense.weapon = getRandom(2,8);
	enemy.weapon = weapons[getRandomWeapon];
	return enemy 
}

function attack(attacker, defender) {
	var damage = 0;
	var attackerRoll = getRandom(1, attacker.initiative);
	var defenderRoll = getRandom(1, defender.initiative);
	// console.log(attacker.name + "'s roll is: " + attackerRoll )
	// console.log(defender.name + "'s roll is: " + defenderRoll )
	if ( attackerRoll > defenderRoll ) { // if attacker rolls higher
		damage = (attackerRoll - defenderRoll) * 2;
		if (roll(defender.block)) { // attack was blocked
			damage = 0;
			logDamage(defender,attacker,'block',damage)
		} else { // attack was not blocked
			if ( roll(attacker.crit) ) { // check for crit
				logDamage(attacker,defender,'crit',damage)
				increaseStatCount(attacker, "crits")
			}
			else { // no crit
				logDamage(attacker,defender,'hit',damage)
			}
		}
		defender.health -= damage
	} else if ( defenderRoll > attackerRoll ) { // if defender rolls higher
		damage = defender.strength + defenderRoll - attackerRoll - attacker.defense.armor
		if ( roll(defender.crit) ) { // check for crit
			damage = (damage + defender.crit) * 2
			logDamage(defender,attacker,'crit',damage)
			attacker.health -= damage
			increaseStatCount(defender, "crits")
		} else { // Defender counterattacks
			logDamage(defender,attacker,'hit',damage)
			attacker.health -= damage
		}
	} else { //Attacks are even, nothing happens. Log something here later.
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
			case 'blocks': stats.blocks += 1;
				break;
			case 'crits': stats.crits+= 1;
				break;
			case 'attacks': stats.attacks += 1;
				break;
			case 'kills': stats.kills += 1;
			default: return
		}
	} else {
		return
	}
}

function logDamage(whoIsHitting, whoIsGettingHit, typeOfHit, damage){
	switch(typeOfHit) {
		case 'block': console.log (whoIsGettingHit.name + '(' + whoIsGettingHit.health + ") BLOCKS attack by " + whoIsHitting.name + '.');
			break;
		case 'crit': console.log (whoIsHitting.name + '(' + whoIsHitting.health + ") CRITS " + whoIsGettingHit.name + '(' + whoIsGettingHit.health + ') for ' + damage + ' damage with their ' + whoIsHitting.weapon);
			break; 
		case 'hit': console.log (whoIsHitting.name + '(' + whoIsHitting.health + ") hits " + whoIsGettingHit.name + '(' + whoIsGettingHit.health + ') for ' + damage + ' damage with their ' + whoIsHitting.weapon);
			break; 
	}
}

