//// modified from @atnoslen with a little help from @Atropos (thanks!) 
const scene = game.scenes.entities.filter(scene => scene.active === true)[0];

  let tokens = [];

  let startCRoll=function rollAndStart(){
    game.combat.rollAll();
   
}


  if (!game.combat){
    scene.data.tokens.forEach(function(token) {
      tokens.push({tokenId:token._id});
    });

    Combat.create({scene:scene.data._id, combatants:tokens}).then(startCRoll);
 
  } else {
    // Combat already exists, add the missing tokens.
    // This assumes createCombatant is expensive, so create an array
    // instead of calling individually.

    scene.data.tokens.forEach(function(token) {
      if (game.combat.combatants.filter(combatant => combatant.tokenId === token._id).length === 0) {
        tokens.push({tokenId:token._id});
      }
    });

    game.combat.createCombatant(tokens).then(startCRoll);
    

  }

