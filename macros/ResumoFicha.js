//v1.1
let persona=canvas.tokens.controlled[0].actor;
let attrPerson=[];

attrPerson['agility']=parseInt(persona.data.data.attributes.agility.die.sides);
attrPerson['spirit']=parseInt(persona.data.data.attributes.spirit.die.sides);
attrPerson['strength']=parseInt(persona.data.data.attributes.strength.die.sides);
attrPerson['smarts']=parseInt(persona.data.data.attributes.smarts.die.sides);
attrPerson['vigor']=parseInt(persona.data.data.attributes.vigor.die.sides);

let attpoints=0;
let skillpoints=0;
let edgesnum=0;
let hindpoints=0;
let equipval=0;

Object.keys(attrPerson).forEach((key) => attpoints+=(attrPerson[key]/2)-1);

let skills=persona.items.filter((el) => el.type == "skill");

for (let i=0;i<skills.length;i++){
    if (skills[i].name.indexOf('*')<0){
    let skillval=parseInt(skills[i].data.data.die.sides);
    let atassoc=attrPerson[skills[i].data.data.attribute];
    skillpoints+=(skillval/2)-1;

    if(atassoc<skillval){
        skillpoints+=(skillval-atassoc)/2;
    }
}
}

skillpoints=skillpoints-5;

edgesnum=persona.items.filter((el) => el.type == "edge" && el.name.indexOf('*')<0).length;

let hinds=persona.items.filter((el) => el.type == "hindrance" && el.name.indexOf('*')<0);

for (let i=0;i<hinds.length;i++){
    if (hinds[i].data.data.major){
        hindpoints+=2;
    } else {
        hindpoints++;
    }
}

var equipstypes=['gear','armor','weapon','shield'];
let equips=persona.items.filter((el) => equipstypes.includes(el.type) && el.name.indexOf('*')<0);


for (let i=0;i<equips.length;i++){
    equipval+=equips[i].data.data.price;
}

let attpts=attpoints-5;

let hindstyle='';
let attstyle='';
let skillstyle='';
let edgestyle='';



if (hindpoints>4){
    hindstyle=' style="color:red" ';
}

if (attpts<5){
    attstyle=' style="color:red" ';
}

if (skillpoints<12){
    skillstyle=' style="color:red" ';
}

if (edgesnum<1){
    edgestyle=' style="color:red" ';
}

let message=`<strong style="font-size:18px">`+persona.name+`</strong>`;
message+=`<p${attstyle}><strong>Atributos:</strong> `+attpts+` </p>`;
message+=`<p${skillstyle}><strong>Perícias:</strong> `+skillpoints+` (+5 básicas)</p>`;
message+=`<p${edgestyle}><strong>Vantagens:</strong> `+edgesnum+`</p>`;
message+=`<p${hindstyle}><strong>Complicações:</strong> `+hindpoints+` pts</p>`;
message+=`<p><strong>Valor em Equipamentos:</strong> $ `+equipval+`</p>`;
message+=`<p>Coloque * nos nomes para ignorar na contagem (para "sem perícia", habilidades de raça, etc)</p>`;

let extraatt=0;
let extraskill=0;
let extraedges=0;
let extrapts=0;

if (attpts>5){
    extraatt=attpts-5;
    extrapts+=extraatt*2;    
}

if (skillpoints>12){
    extraskill=skillpoints-12;
    extrapts+=extraskill;
}

if (edgesnum>1){
    extraedges=edgesnum-1;
    extrapts+=extraedges*2
}

extrapts=extrapts-hindpoints;

if (hindstyle!=''){
    message+=`<p style="color:red">Pode haver um erro nas Complicações (normalmente o máximo é 4). Todos os pontos foram considerados na contagem de Progresso.</p>`;
}

if (attstyle!=''){
    message+=`<p style="color:red">O personagem tem menos de 5 pontos de atributos</p>`;
}


if (skillstyle!=''){
    message+=`<p style="color:red">O personagem tem menos de 12 pontos de perícias</p>`;
}

if (edgestyle!=''){
    message+=`<p style="color:red">O personagem não tem vantagens. Desconsidere esse aviso se ele não for humano.</p>`;
}

if (extrapts>0){
    let advances=Math.floor(extrapts/2);
    message+=`<p>O personagem aparenta ter <strong>${advances} Progressos</strong> considerando um humano.</p>`;
    if (extrapts%2>0){
        message+=`<p style="color:red">Parece haver 1 ponto de perícia extra.</p>`;
    }
} else {
message+=`<p>Não parece haver Progresso nesse personagem, considerando um humano.</p>`
}


let chatData = {
    user: game.user._id,
    speaker: ChatMessage.getSpeaker(),
    content: message
    
};
ChatMessage.create(chatData, {});
