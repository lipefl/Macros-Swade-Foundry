//v1.2
let dialogTemplate=``;
var hasTarget=true;
var targets=Array.from(game.user.targets);
if (targets.length<=0){
    dialogTemplate+=`<div style="background:red;color:white;padding:3px">Nenhum alvo selecionado. Uma rolagem de dano será feita, sem automatização. Dano fixo somente mostrará o dano</div>`;
    hasTarget=false;
} 

var tokenActor=canvas.tokens.controlled[0];
var currentActor=false
if (tokenActor===undefined){
dialogTemplate+=`<div style="background:#00b0ff;color:white;padding:3px">Nenhum atacante selecionado. O uso do bene não será automatizado. Ignore esse aviso no caso de dano fixo</div>`;
}  else {
    currentActor=tokenActor.actor;
}
var damageDie;
var useAP=0;
var key=0;
var woundsNum=[];
var displayAll=true;
var showingDamageBtn=[];
var fixedDmg=false;

let template=``;


dialogTemplate+=`<p>No campo Dano é possível usar valores fixos (12) ou rolagens (3d6)</p><p>Dano: <input type="text" style="width:100px" id="dano" /> `;
dialogTemplate+=`PA: <input type="number" style="width:50px" id="pa" value="0" /></p>`;

new Dialog({
    title: 'Dano em Área',
    content: dialogTemplate,
    buttons: {
        ok: {
            label: `Causar Dano`,
            callback: function (html) {
                applyFormOptions(html);
            },
        }
    },
}).render(true);

function applyFormOptions(html){
    damageDie=html.find("#dano")[0].value;
    useAP=parseInt(html.find("#pa")[0].value);

    if (damageDie.indexOf('d')<0){
        fixedDmg=true;
    }

    if (!hasTarget){
        doDamage(false);

    } else {

    for (const target of targets){
        doDamage(target);
        key++;
    }

}

    if (displayAll){
        displayRolls();
    }

    
   
    
   
}

function doDamage(tokenTarget){

    if (!displayAll){
        template=``;
    }

    let useTarget=false;

    if (hasTarget){
        useTarget=tokenTarget.actor;
    }
    
    let damageTotal;
    let rollData;
    
    if (!fixedDmg){
        let areaDamage=makeDamageFormula(damageDie);
        rollData=new Roll(areaDamage).roll();
        damageTotal=rollData.total;
    } else {
        damageTotal=parseInt(damageDie);
    }
    
    let damageModStr=``;
    

   
    if (hasTarget){
        template+=`<strong style="font-size:16px">`+useTarget.name+` (`+(key+1)+`)</strong>`;
    }
   
    let dieSumResult=0;
    template+=`<div class="dice-tooltip"><div class="dice-rolls"><ol class="dice-rolls">`;

    if (!fixedDmg){
    for (let i=0;i<rollData.dice.length;i++){
        for (let j=0;j<rollData.dice[i].results.length;j++){
            let diceResult=rollData.dice[i].results[j].result;
            while(rollData.dice[i].results[j].exploded){
                j++;
                diceResult+=rollData.dice[i].results[j].result;
               
            }
            template+=`<li class="roll die d`+rollData.dice[i].faces+`" style="color:#333">`+diceResult+`</li>`;
        }
        dieSumResult+=rollData.dice[i].total;
        
    }
    let damageMod=damageTotal-dieSumResult;

    if (damageMod>0){
        damageModStr=`+`+damageMod;
    }

    }

    template+=`<li style="line-height:24px;float:left;font-size:16px;color:#333;font-weight:bold">`;
    if (!fixedDmg){
        template+=damageModStr+`=`;
    }
    
    template+=`<span style="margin-left:5px;color:red">`+damageTotal+`</span></li>`;

    if (!fixedDmg){
        template+=`<li style="line-height:24px;float:right;font-size:16px"><button style="background:#CCC;" id="reRollDamageButton_`+key+`">Rerrolar</button></li>`;
    }
    

    template+=`</ol></div></div>`;

    showingDamageBtn[key]=false;
    if (hasTarget){

    let armor=parseInt(useTarget.data.data.stats.toughness.armor); /// modify using AP
    if (useAP){
        armor=armor-useAP;
        if (armor<0){
            armor=0;
        }
        
    }

    let targetNumber=parseInt(useTarget.data.data.stats.toughness.value)+parseInt(useTarget.data.data.stats.toughness.modifier)+armor;

    let tag=`Nenhum Dano`;
    let colortag='#666';   

    let applyDamageButton=``;  
    

    if (damageTotal>=targetNumber){ /// calculate success/raises
        applyDamageButton=`<button id="applyDamage_`+key+`" style="background:red;color:white">Aplicar Dano</button>`;
        showingDamageBtn[key]=true;
        let damageAmount=damageTotal-targetNumber
        let raises=Math.floor(damageAmount/4);
        woundsNum[key]=raises;

       

        if (raises==0){ /// success=shaken
             tag=`Abalado` 
             colortag='#0d47a1';
        } else {
            let plural=``;
            if (raises>1){
                plural=`s`;
            }
            tag=raises+` Ferimento`+plural+` + Abalado`;

            if (raises==1){
                colortag='#f44336'
            } else if (raises==2){
                colortag='#b71c1c';
            } else if (raises==3){
                colortag='#9c27b0';
            } else {
                colortag='#4a148c';
            }
            
        }

        
    }


    template+=`<div style="color:`+colortag+`;font-weight:bold;text-align:center;line-height:24px;font-size:16px;">`+tag+`</div>`;

    template+=applyDamageButton;



    if (displayAll){
        template+=`<div style="height:10px"></div>`; ///spacer
    }
   
}
    
    if (!displayAll){

        
    let extraFlavor=``;
    if (useAP){
        extraFlavor=` PA:`+useAP;
    }  

        let chatData = {
            user: game.user._id,
            speaker: ChatMessage.getSpeaker(),
            content: template,
        flavor: `Dano `+damageDie+extraFlavor+` (Rerrolagem)`
        };
        ChatMessage.create(chatData, {});


        addEventListenerOnHtmlElement("#reRollDamageButton_"+key, 'click', (e) => { 
        
            if (currentActor){
                useBenny(tokenTarget); 
            } else {
                doDamage(tokenTarget);
            }
            
             
          }); 
          
            if (showingDamageBtn[key]){
          addEventListenerOnHtmlElement("#applyDamage_"+key, 'click', (e) => { 
            
             
             applyDamage(woundsNum[key],e.target,tokenTarget);        
             
          });
        }
    }
    
    
   
}




function applyDamage(wounds,buttonObj,tokenTarget){
    let useTarget=tokenTarget.actor;
    let actualWounds=useTarget.data.data.wounds.value;
    let maxWounds=useTarget.data.data.wounds.max;
    let shakenStat=useTarget.data.data.status.isShaken;
    let isWCard=useTarget.data.data.wildcard;
    let isDefeated=false;
    

    if (!wounds && shakenStat){ /// shaken + shaken = 1 wound
        
            wounds=1;
        
    }

    if (!isWCard){
        if (wounds>0) {
            tokenTarget.toggleOverlay(CONFIG.controlIcons.defeated); /// mark as defeated
            isDefeated=true;            

        }
        
    } else {
        let newWounds=actualWounds+wounds;


        if (newWounds>maxWounds){
            newWounds=maxWounds;
            tokenTarget.toggleOverlay(CONFIG.controlIcons.defeated); /// mark as defeated
            isDefeated=true;
        }
    
        useTarget.update({"data.wounds.value":newWounds});
    }   
    
    if (!isDefeated){
    useTarget.update({"data.status.isShaken":true});
    } else {
        if (shakenStat){ /// if defeated, removes shaken if shaken
            useTarget.update({"data.status.isShaken":false});
        }
    }
   

    buttonObj.innerText='Dano Aplicado';
    buttonObj.disabled=true;
    buttonObj.style.background='#CCC';
    buttonObj.style.color='red';

    /// currentTarget.toggleOverlay(CONFIG.controlIcons.defeated) /// mark defeated
    
}

function makeDamageFormula(weaponDamage){
    //let regexStr = /[@]str/g;
           // weaponDamage = weaponDamage.replace(regexStr, "1d" + currentActor.data.data.attributes.strength.die.sides);

            let regexDiceExplode = /d[0-9]{1,2}/g;
            weaponDamage = weaponDamage.replace(regexDiceExplode, "$&x=");

return weaponDamage;
           

}

function addEventListenerOnHtmlElement(element, event, func){
    // Use Hook to add event to chat message html element
    Hooks.once("renderChatMessage", (chatItem, html) => { 
        html[0].querySelector(element).addEventListener(event, func);
    });
} // end addEventListenerOnHtmlElement

function displayRolls(){

    if (hasTarget){
        key--;
    }
   
    displayAll=false;

    let extraFlavor=``;
    if (useAP){
        extraFlavor=` PA:`+useAP;
    }    

    

    let chatData = {
        user: game.user._id,
        speaker: ChatMessage.getSpeaker(),
        content: template,
    flavor: `Dano `+damageDie+extraFlavor
    };
    ChatMessage.create(chatData, {});

  

    for(let i=0;i<=key;i++){
        
    addEventListenerOnHtmlElement("#reRollDamageButton_"+i, 'click', (e) => { 
        
       key=i;

       if (hasTarget){

       if (currentActor){
        useBenny(targets[i]); 
    } else {
        doDamage(targets[i]);
    }
} else {
    if (currentActor){
        useBenny(false); 
    } else {
        doDamage(false);
    }
}

      
        
     }); 
     
     if (showingDamageBtn[i]){
     addEventListenerOnHtmlElement("#applyDamage_"+i, 'click', (e) => { 
       
        
        applyDamage(woundsNum[i],e.target,targets[i]);        
        
     });
    }
     
    }

}

function displayOnChat(aliasName,contentText,flavorText=''){

    let chatData = {
        user: game.user._id,
        speaker: {alias:aliasName},
        content: contentText,
    flavor: flavorText
    };
    ChatMessage.create(chatData, {});

}


function useBenny(tokenTarget){
    let useActor=currentActor;
    let actualBennies;
    let gmPlayer;
    let useGMBene=false;
   
    
    
    if (useActor.data.data.wildcard){
        actualBennies=parseInt(useActor.data.data.bennies.value);
        if (useActor.data.type=='npc' && actualBennies<=0){
            useGMBene=true; /// uses gm benny if it's an enemy WC and has no bennies.
        }
    } else {
        useGMBene=true;
    }

    if (useGMBene){
        gmPlayer=game.users.filter((el)=> el.isGM===true)[0];
        actualBennies=parseInt(gmPlayer.data.flags.swade.bennies);
    }

    let dialogStart='O personagem tem ';
    if (useGMBene){
        dialogStart=`O personagem não tem benes.<br> O GM tem `;
    }

    let beneword='Benes';
    if (actualBennies==1){
        beneword='Bene';
    }


let dialogTemplate='<p>'+dialogStart+actualBennies+' '+beneword+'.</p><p>Deseja gastar 1 Bene para rerrolar o dano?';

    if (actualBennies){
        new Dialog({
            title: 'Confirmação de uso de Bene',
            content: dialogTemplate,
            buttons: {
                ok: {
                    label: `Gastar 1 Bene`,
                    callback: function () {
                        actualBennies=actualBennies-1;
                        let whoIs;
                        if (!useGMBene){
                            useActor.update({"data.bennies.value":actualBennies});
                            whoIs=useActor.name;            
                        } else {
                            gmPlayer.update({"flags.swade.bennies":actualBennies});
                            whoIs='Mestre'; 
                        }
                        
                        displayOnChat(whoIs,'Gasta 1 Bene para rerrolar.');
                        
                            doDamage(tokenTarget);
                        
                        
                    },
                },
                'cancel': {
                    label: `Cancelar`,
                    callback:function(){
                        return false;
                    }
                }
            }
        }).render(true);
    } else {
        new Dialog({
            title: 'Sem Benes',
            content: '<p>Você não tem Benes para rerrolar.</p>',
            buttons: {
            'ok': {
                label: 'Ok',
                callback: function(){
                    return false;
                }
            }
        }
        }).render(true);
    }
}