//v1.1
let actualCombatants=game.combat.turns;
let checkJoker=actualCombatants.find(el=>el.flags.swade.hasJoker==true);

if (checkJoker!==undefined){ /// a joker has been drawn
    let theJoker=checkJoker.actor;
    let howMany=0;
    let gmJoker=false; ///PC - all players get a benny

    if (theJoker.data.type=='npc'){ /// NPC - GM gets a benny and each NonPC-WC

        gmJoker=true;

    } 

    for (let i=0;i<actualCombatants.length;i++){
        let checkActor=actualCombatants[i].actor;
        let giveBenny=false;
        if (gmJoker){

            if (checkActor.data.type=='npc' && checkActor.data.data.wildcard){
                /// give npc wildcard a benny
                giveBenny=true;
            }

        } else {
            if (checkActor.data.type=='character'){
                /// give pc a benny
                giveBenny=true;
            }
        }

        if (giveBenny){
        howMany++;
        let actualBennies=parseInt(checkActor.data.data.bennies.value);
        actualBennies++;
        checkActor.update({"data.bennies.value":actualBennies});
        }
       
    }

    if(gmJoker){ /// also give gm a benny
        let gmPlayer=game.users.filter((el)=> el.isGM===true)[0];
        let actualBennies=parseInt(gmPlayer.data.flags.swade.bennies);
        actualBennies++;
        gmPlayer.update({"flags.swade.bennies":actualBennies})
    }


    let contentText='<div style="font-style:strong">Benes entregues:</div>';
    
    
    if (gmJoker){
        contentText+='<div><strong>Inimigos:</strong> '+howMany+'</div>';
        contentText+='<div><strong>Mestre:</strong> 1</div>';
    } else {
        contentText+='<div>Personagens: '+howMany+'</div>';
    }

    let chatData = {
        user: game.user._id,
        speaker: {alias:"O Curinga"},
        content: contentText
    };
    ChatMessage.create(chatData, {});

} else {
    ui.notifications.warn("Nenhum Curinga foi sacado no combate atual.");    
}    
