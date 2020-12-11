let actors=Array.from(game.actors);
for (let i=0;i<actors.length;i++){
    actors[i].update({"token.name":actors[i].name});

}

new Dialog({
    title: 'Nomes Atualizados',
    content: 'Nomes Atualizados',
    buttons: {
        ok: {
            label: `ok`,
            callback: function () {
               return false;
            },
        }
    },
}).render(true);
