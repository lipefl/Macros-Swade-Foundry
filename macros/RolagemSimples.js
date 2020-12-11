// v1.0
var personas=canvas.tokens.controlled;
if (personas.length<=0){
    simpleDialog();
} else {
    tokenDialog();
}
function tokenDialog(){
        let template=``;
        template+=`<div style="background:#00b0ff;color:white;padding:3px">Há tokens selecionados. Para ignorar os tokens e escolher os dados rolados, clique no botão Escolher Dados</div>`;
        template+=`<p>Característica: <select id="caract">`;
        template+=`<optgroup label="Atributos">`;
        template+=`<option value="Agilidade">Agilidade</option>`;
        template+=`<option value="Astúcia">Astúcia</option>`;
        template+=`<option value="Espírito">Espírito</option>`;
        template+=`<option value="Força">Força</option>`;
        template+=`<option value="Vigor">Vigor</option>`;
        template+=`</optgroup>`;
        template+=`<optgroup label="Perícias">`;
        for (let i=0;i<personas.length;i++){
            let skills=personas[i].actor.items.filter((el) => el.type == "skill");
            let skillList=[];
            for (let j=0;j<skills.length;j++){
                
                if (!skillList.includes(skills[j].name)){
                    template+=`<option value="`+skills[j].name+`">`+skills[j].name+`</option>`;
                }
                skillList.push(skills[j].name);
            }
        }
        template+=`</optgroup>`;
        template+=`</select></p>`;
        
        template+=`<p>Modificador: <input type="text" id="modificador" value="" style="width:50px" /></p>`;
        template+=`<p>Número Alvo: <input type="text" id="targetnum" value="4" style="width:50px" /></p>`;
        
        
        new Dialog({
            title: 'Rolagem de Token',
            content: template,
            buttons: {
                cancel: {
                    label: `Escolher Dados`,
                    callback: function (html) {
                        simpleDialog();
                    }
                },
                ok: {
                    label: `Rolar`,
                    callback: function (html) {
                        applyFormOptionsToken(html);
                    }
                },
                
            }
        }).render(true);
        
            }

            
function simpleDialog(){
let template=``;
if (personas.length<=0){
template+=`<div style="background:#00b0ff;color:white;padding:3px">Não há tokens selecionados. Se deseja rolar a partir das características dos tokens, selecione antes de executar a macro</div>`;
}
template+=`<p>Dado: <select id="dice">`

template+=`<option value="d4">d4</option>`;
template+=`<option value="d6">d6</option>`;
template+=`<option value="d8">d8</option>`;
template+=`<option value="d10">d10</option>`;
template+=`<option value="d12">d12</option>`;

template+=`</select></p>`;

template+=`<p><label style="font-size:16px"><input type="checkbox" id="wild" value="1" checked style="margin:0;vertical-align:middle" /> Carta Selvagem</label></p>`;
template+=`<p>Modificador: <input type="text" id="modificador" value="" style="width:50px" /></p>`;
template+=`<p>Número Alvo: <input type="text" id="targetnum" value="4" style="width:50px" /></p>`;

template+=`<p>Rolar: <input type="text" id="repetir" value="1" style="width:50px" /> vez(es)</p>`;

new Dialog({
    title: 'Rolagem Simples',
    content: template,
    buttons: {
        ok: {
            label: `Rolar`,
            callback: function (html) {
                applyFormOptionsSimpleRoll(html);
            }
        }
    }
}).render(true);
}


function applyFormOptionsToken(html){
    let caractName=html.find("#caract")[0].value;
    let targetNumber=parseInt(html.find("#targetnum")[0].value);
    let modificador=Number(html.find("#modificador")[0].value);
    let contentText=``;
    
   
    let atributes={'Agilidade':'agility','Astúcia':'smarts','Espírito':'spirit','Vigor':'vigor','Força':'strength'};

    for (let i=0;i<personas.length;i++){
        
        let isWCard=personas[i].actor.data.data.wildcard;  
        let dice;
        let wilddice='d6';
        let caractmod=0;
        let modStr='';

        let addCaracName=``;

    if (atributes[caractName]!==undefined){
        let attkey=atributes[caractName];
        dice='d'+personas[i].actor.data.data.attributes[attkey].die.sides;
        if (isWCard){
            wilddice='d'+personas[i].actor.data.data.attributes[attkey]["wild-die"].sides;
        }

        caractmod=Number(personas[i].actor.data.data.attributes[attkey].die.modifier);

    } else {
        /// is skill
        let skill=personas[i].actor.items.filter((el) => el.type == "skill" && el.name==caractName)[0];
        if (skill!==undefined){
            dice='d'+skill.data.data.die.sides;
            if (isWCard){
            wilddice='d'+skill.data.data["wild-die"].sides;
            }
            caractmod=Number(skill.data.data.die.modifier);

        } else {
            dice='d4';
            caractmod=caractmod-2;
            addCaracName=` (sem perícia -2)`;
        }
    }

    if (modificador!=0){
        if (modificador>0){
            modStr+='+';
        }
    
        modStr+=String(modificador);
    }

      let  modificadorFinal=modificador+caractmod;
    
      contentText+=`<strong style="font-size:16px">`+personas[i].actor.name+`</strong>`;

      contentText+='<div style="color:#4b4a44;font-size:12px">rola '+caractName+addCaracName+modStr+' | TN:'+targetNumber+'</div>';  
       
        contentText+=resultInfo(dice,targetNumber,modificadorFinal,isWCard,wilddice);

        
    }

    let chatData = {
        user: game.user._id,
        speaker: ChatMessage.getSpeaker(),
        content: contentText
    };
    ChatMessage.create(chatData, {});
    

}


function applyFormOptionsSimpleRoll(html){
    let dice=html.find("#dice")[0].value;
    let isWCard=html.find("#wild")[0].checked;
    let targetNumber=parseInt(html.find("#targetnum")[0].value);
    let repeat=parseInt(html.find("#repetir")[0].value);
    let modificador=Number(html.find("#modificador")[0].value);
    let contentText=``;
    let flavor=dice;
    
    
    if (modificador){

        let modificadorStr=String(modificador);
        if (modificador>0){
            modificadorStr='+'+modificadorStr;
        }
        flavor+=modificadorStr;
        
    }

    if (isWCard){
        flavor+=` (CS)`
    }

    if (repeat>1){
        flavor+=' x'+repeat;
    }

    flavor+=' NA:'+String(targetNumber);

    

    
    
    for(let i=1;i<=repeat;i++){
       
        contentText+=resultInfo(dice,targetNumber,modificador,isWCard);

    }

    
    let chatData = {
        user: game.user._id,
        speaker: ChatMessage.getSpeaker(),
        content: contentText,
        flavor: flavor
    };
    ChatMessage.create(chatData, {});
}



function resultInfo(mainDie,targetNumber,modifier=0,isWCard=true,wilddie='d6'){ 
    let mainDieResult=new Roll('1'+mainDie+'x=').roll().total;
    let wilddieResult=new Roll('1'+wilddie+'x=').roll().total;
    let textColor='grey';
    let mainDieColor='#666';
    let wilddieColor='#666';
    let tag='Falha';
    let criticalFailure=false;
    let showWildDie=false;
    let raise=false;
    let contentText=``;
    let finalMainDieResult;
    let finalWilddieResult;
    let finalResult;

    if (mainDieResult==1){
        mainDieColor='red';
    }

    if (wilddieResult==1){
        wilddieColor='red';
    }

    if (isWCard){
        showWildDie=true;
    }

    if (mainDieResult==1 && wilddieResult==1){
        tag='Falha Crítica!';
        textColor='red';
        
        if (!isWCard){
           showWildDie=true;
        }

        criticalFailure=true;
        finalMainDieResult=1;
        finalWilddieResult=1;
        finalResult=1;

   }

   

   if (!criticalFailure){
    finalMainDieResult=mainDieResult+modifier;
    finalWilddieResult=0;
    finalResult=finalMainDieResult;
    
    if (isWCard){   
         finalWilddieResult=wilddieResult+modifier;
         finalResult=Math.max(finalWilddieResult,finalMainDieResult);
    }
    

    if (finalMainDieResult>=targetNumber || finalWilddieResult>=targetNumber){
       
        
        let targetNumberRaise=targetNumber+4

        if (finalMainDieResult>=targetNumber){
            mainDieColor='green';
            if (finalMainDieResult>=targetNumberRaise){
                raise=true;
                mainDieColor='purple';
            }
        }

        if (finalWilddieResult>=targetNumber){
            wilddieColor='green';
            if (finalWilddieResult>=targetNumberRaise){
                raise=true;
                wilddieColor='purple';
            }
        }
        
        
        
        if (raise){
        //    raiseStr=1;
            
            let raiseNum=Math.floor(finalResult/4);
            let wordAmp='Ampliação';
            if (raiseNum>1){
                wordAmp='Ampliações';
            } 
            tag=raiseNum+' '+wordAmp;
            textColor='purple';
            
        } else {
            tag='Sucesso!';
            textColor='green';
        }
 
    

    }
   }

   contentText+=`<div class="dice-tooltip"><div class="dice-rolls"><ol class="dice-rolls"><li class="roll die `+mainDie+`" style="color:`+mainDieColor+`">`+finalMainDieResult+`</li>`;

    if (showWildDie){
        contentText+=`<li class="roll die `+wilddie+`" style="color:`+wilddieColor+`">`+finalWilddieResult+`</li>`
    }

    contentText+=`<li style="line-height:24px;float:left;font-size:16px;color:`+textColor+`;font-weight:bold;margin-left:10px">`+tag+`</li>`;

    contentText+=`</ol></div></div>`;


    return contentText;


}