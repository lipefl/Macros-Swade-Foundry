/// v1.0

const human={
tokenimg:'https://i.imgur.com/6hCuzfM.png',
nome:'Jonas Ferreira',
actorimg:'https://i.imgur.com/a3TifFu.jpg'
};

const hero={
tokenimg:'https://i.imgur.com/H4l2Xw1.png',
nome:'Kamen Rider BR',
actorimg:'https://i.imgur.com/H4l2Xw1.png'
};

let tokens=actor.getActiveTokens();

for (let tk of tokens){
if (tk.document.texture.src==human.tokenimg){
tk.document.update({"texture.src":hero.tokenimg})
} 
else {
tk.document.update({"texture.src":human.tokenimg})
} 
}
