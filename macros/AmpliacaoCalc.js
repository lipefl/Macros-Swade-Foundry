//v1.0
let template=``;

template+=`<p>Resultado: <input type="text" id="resultado" value="" style="width:50px" /></p>`;
template+=`<p>Número Alvo: <input type="text" id="targetnum" value="4" style="width:50px" /></p>`;

new Dialog({
    title: 'Rolagem de Característica',
    content: template,
    buttons: {
        ok: {
            label: `Calcular`,
            callback: function (html) {
                applyFormOptions(html);
            },
        }
    },
}).render(true);

function applyFormOptions(html){
    let targetNumber=parseInt(html.find("#targetnum")[0].value);
    let resultado=parseInt(html.find("#resultado")[0].value);

    let raises=Math.floor((resultado-targetNumber)/4);

    let flavor='Resultado:'+resultado+' | NA:'+targetNumber;

    let contentText=raises+` Ampliações`;

    let chatData = {
        user: game.user._id,
        speaker: ChatMessage.getSpeaker(),
        content: contentText,
        flavor: flavor,
        whisper: ChatMessage.getWhisperRecipients("GM")
    };
    ChatMessage.create(chatData, {});
}