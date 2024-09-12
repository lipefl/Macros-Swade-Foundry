// v1.1
// Enviar cartas para jogadores criando as mãos
// construído com a ajuda do CHAT GPT 4
// Função para criar o diálogo e obter as informações
async function obterInformacoes() {
  return new Promise((resolve) => {
    new Dialog({
      title: "Distribuição de Cartas",
      content: `
        <form>
          <div class="form-group">
            <label>Quantidade de Cartas:</label>
            <input type="number" name="quantidade" value="1"/>
          </div>
          <div class="form-group">
            <label>Baralho:</label>
            <select name="baralho">
              ${game.cards.filter(deck => deck.type === "deck").map(deck => `<option value="${deck.id}">${deck.name}</option>`).join("")}
            </select>
          </div>
          <div class="form-group">
            <label>Resetar Mãos:</label>
            <input type="checkbox" name="resetar" checked/>
          </div>
          <div class="form-group">
            <label>Entregar para:</label>
            <select name="entregarPara">
              <option value="todos">Todos os Jogadores</option>
              <option value="selecionados">Jogadores Selecionados</option>
            </select>
          </div>
          <div class="form-group" id="jogadores-selecionados" style="visibility: hidden;">
            ${game.users.players.filter(jogador => !jogador.isGM).map(jogador => `
              <label>
                <input type="checkbox" name="jogador-${jogador.id}" value="${jogador.id}"/> ${jogador.name}
              </label>
            `).join("")}
          </div>
        </form>
      `,
      buttons: {
        ok: {
          label: "Distribuir",
          callback: (html) => {
            const quantidade = parseInt(html.find('[name="quantidade"]').val());
            const baralhoId = html.find('[name="baralho"]').val();
            const resetar = html.find('[name="resetar"]').is(":checked");
            const entregarPara = html.find('[name="entregarPara"]').val();
            const jogadoresSelecionados = entregarPara === "selecionados" 
              ? html.find('input[type="checkbox"][name^="jogador-"]:checked').map((i, el) => $(el).val()).get()
              : null;
            resolve({ quantidade, baralhoId, resetar, entregarPara, jogadoresSelecionados });
          }
        }
      },
      default: "ok",
      render: (html) => {
        html.find('[name="entregarPara"]').change(event => {
          const value = event.target.value;
          if (value === "selecionados") {
            html.find('#jogadores-selecionados').css('visibility','visible');
          } else {
            html.find('#jogadores-selecionados').css('visibility','hidden');
          }
        });
      }
    }).render(true);
  });
}

// Função para distribuir cartas para uma mão de cartas
async function distribuirCartas(mao, baralho, quantidade) {
  // Usar o método draw para obter as cartas do baralho
  const cartas = await mao.draw(baralho, quantidade, { how: CONST.CARD_DRAW_MODES.RANDOM });

}

// Função para resetar as mãos dos jogadores
async function resetarMaos(jogadores) {
  for (let jogador of jogadores) {
    let maoExistente = game.cards.find(c => c.name === `Mão de ${jogador.name}` && c.type === "hand");
    if (maoExistente) {
      const cartasIds = maoExistente.cards.map(c => c.id);
      await maoExistente.deleteEmbeddedDocuments("Card", cartasIds);
    }
  }
}

// Obter as informações do diálogo
const informacoes = await obterInformacoes();
if (informacoes) {
  const { quantidade, baralhoId, resetar, entregarPara, jogadoresSelecionados } = informacoes;
  const baralho = game.cards.get(baralhoId);

  let jogadores = game.users.players.filter(jogador => !jogador.isGM && jogador.active);
  
  if (entregarPara === "selecionados") {
    jogadores = jogadores.filter(jogador => jogadoresSelecionados.includes(jogador.id));
  }

  if (resetar) {
    await resetarMaos(jogadores);
  }

  // Iterar sobre todos os jogadores selecionados e criar uma mão para cada um, distribuindo as cartas
  for (let jogador of jogadores) {
    const nomeJogador = jogador.name;

    // Verificar se já existe uma mão de cartas para o jogador
    let maoExistente = game.cards.find(c => c.name === `Mão de ${nomeJogador}` && c.type === "hand");

    if (!maoExistente) {
      // Criar uma nova mão de cartas para o jogador
      maoExistente = await Cards.create({
        name: `Mão de ${nomeJogador}`,
        type: "hand",
        img: "icons/svg/cards.svg",
        cards: []
      });

      // Configurar permissões para todos os jogadores
      const permissoes = {};
      game.users.players.forEach(user => {
        permissoes[user.id] = 3; // 3 significa permissão de "proprietário"
      });
      await maoExistente.update({ permission: permissoes });
    } else {
      // Configurar permissões para todos os jogadores na mão existente
      const permissoes = {};
      game.users.players.forEach(user => {
        permissoes[user.id] = 3; // 3 significa permissão de "proprietário"
      });
      await maoExistente.update({ permission: permissoes });
    }

    // Distribuir as cartas para a mão do jogador
    await distribuirCartas(maoExistente, baralho, quantidade);
  }

  // Notificar os jogadores
  ui.notifications.info("Cartas distribuídas!");
}
