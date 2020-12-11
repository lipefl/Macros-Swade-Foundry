/// inspirado pelo modulo TimedEvent 
if (game.combat && game.combat.round && game.combat.round!==undefined){
var combatRound=game.combat.round;
var timedEvents = game.combat.data.flags.TimedEvents;


let template=``;

if (timedEvents && timedEvents.length>0){

    template+=`<div style="background:#00b0ff;color:white;padding:3px">Há `+timedEvents.length+` evento(s) em curso.</div>`;
}


template+=`<p>Nome: <input type="text" id="nome" value="" style="width:200px"></p>`;
template+=`<p>Duração: <input type="text" id="duracao" value="5" style="width:50px" /> rodadas</p>`;
template+=`<p>No turno de: <select id="atturn">`;
template+=`<option value="start">Início da Rodada</option>`;

for (let i=0;i<game.combat.combatants.length;i++){
    let select=``;
    if (game.combat.combatants[i].active){
        select=` selected `;
    }
    template+=`<option value="`+game.combat.combatants[i]._id+`"`+select+`>`+game.combat.combatants[i].token.name+`</option>`;
}

template+=`<option value="end">Final da Rodada</option>`;
template+=`</select></p>`;


new Dialog({
    title: 'Contar Duração',
    content: template,
    buttons: {
        view: {
            label: `Ver Eventos em Curso`,
            callback: function(){
                listarEventos();
            }
        },
        ok: {
            label: `Criar Evento`,
            callback: function (html) {
                applyFormOptions(html);
            },

        }
        
    },
}).render(true);

function listarEventos(){
    let pendingEvents = game.combat.data.flags.TimedEvents;
    let display=``;
    let r = game.combat.round;

    for (let i = 0; i<pendingEvents.length;i++){
        let event = pendingEvents[i];
        let leftRounds=event.round-r;
        let turnText;
        if (event.at=='start'){
            turnText=`no Início da Rodada`;
        } else if (event.at=='end'){
            turnText=`no Fim da Rodada`;
            leftRounds-- //normaliza rodada adicionada
        } else {
            turnText=`no turno de: `+game.combat.combatants.find(el=>el._id==event.at).name;
        }

        display+=`<p><strong>`+event.event+`</strong> em `+leftRounds+` rodadas (`+turnText+` )</p>`;

    }

    displayOnChat('Contador',display,pendingEvents.length+' evento(s)');
    return false;
}


function applyFormOptions(html){
    let nome=html.find("#nome")[0].value;
    let duracao=html.find("#duracao")[0].value;
    let atturn=html.find("#atturn")[0].value;
    

    addTimeEvent(nome,duracao,atturn);

    let plural='';
                    if (parseInt(duracao)>1){
                        plural='s';
                    }
                    let turnText='';
                    if (atturn=='start'){
                        turnText=`No Início da Rodada`;
                    } else if (atturn=='end'){
                        turnText=`No Fim da Rodada`;
                    } else {
                        turnText=`No turno de: `+game.combat.combatants.find(el=>el._id==atturn).name;
                    }

    displayOnChat('Contador','<strong>'+nome+'</strong> iniciado.','Duração: '+duracao+' rodada'+plural+' | '+turnText)

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

function addTimeEvent(nome,duracao,atTokenId){
    duracao=parseInt(duracao);
    let finalRound=combatRound+duracao;

    if (atTokenId=='end'){
        finalRound++; /// end of turn = beginning of next
    }

    let newEvent={   "round":finalRound,
                                    "event":nome,
                                    "at":atTokenId,
                                    "duration": duracao
                                }

    if (!timedEvents){
        timedEvents=[];
    }

    timedEvents.push(newEvent);

    game.combat.update({"flags.TimedEvents":timedEvents});


    Hooks.on('renderCombatTracker', () => {
        try {
            let r = game.combat.round;
            let pendingEvents = game.combat.data.flags.TimedEvents;
            let actualCombatant=game.combat.combatants.find(el=>el.active==true);

            for (let i = 0; i<pendingEvents.length;i++){
                let event = pendingEvents[i];
                
                if (r==event.round && (event.at=='start' || event.at=='end' || event.at==actualCombatant._id)){
                    //console.log("Match");
                    let plural='';
                    if (event.duration>1){
                        plural='s';
                    }
                    let turnText='';
                    if (event.at=='start'){
                        turnText=`No Início da Rodada`;
                    } else if (event.at=='end'){
                        turnText=`No Fim da Rodada`;
                    } else {
                        turnText=`No turno de: `+actualCombatant.name;
                    }
                    
                    displayOnChat('Contador','<strong>'+event.event+'</strong> encerra.','Duração: '+event.duration+' rodada'+plural+' | '+turnText);
                    pendingEvents.splice(i,1);
                    Hooks.off;
                }
            }
        }catch {

        }
    })
}

} else {
    ui.notifications.warn("Não há nenhum combate iniciado.");    
}
