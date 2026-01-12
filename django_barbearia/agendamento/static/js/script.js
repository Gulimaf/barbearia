function getCsrfToken() {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const c = cookie.trim();
        if (c.startsWith("csrftoken=")) {
            return c.substring("csrftoken=".length, c.length);
        }
    }
    return "";
}
function getFullDate() {
    const data = new Date();
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');  
    const dia = String(data.getDate()).padStart(2, '0');       
    return `${ano}-${mes}-${dia}`;
}
function getHourNow(){
  const data = new Date();
  const hour = String(data.getHours()).padStart(2,'0');
  const minutes = String(data.getMinutes()).padStart(2,0);
  return `${hour}:${minutes}`;
}
console.log(getHourNow());
let dados;
let servicosSelecionados = [];
let valores = [];
function selecionarCard(is_func,array,nomeEl,precoEl,arraySelecionados = null, arrayValores = null){
    array.forEach(function(card){
        const cardEl = card;
        cardEl.addEventListener('click',function(){
            const nome = cardEl.querySelector(nomeEl).textContent;
            let preco = null;
            if (is_func) {
              array.forEach(c => {
                const checkExistente = c.querySelector('.check-container');
                if (checkExistente) checkExistente.remove();
                c.classList.remove('active');
              });
            }
            if (arrayValores && precoEl){
              preco = Number(cardEl.querySelector(precoEl).textContent.slice(0,2));
            }
            
            let check = cardEl.querySelector('.check-container');
            if (!check){
                check = document.createElement('p');
                check.innerHTML = '<i data-lucide="check"></i>';
                check.classList.add('check-container');
                cardEl.appendChild(check);
                lucide.createIcons();
            }
            if(check){
              if (!is_func){
                if (arraySelecionados.includes(nome)){
                    arraySelecionados.splice(arraySelecionados.indexOf(nome),1);
                }
                else{
                    arraySelecionados.push(nome);
                }
              } else{
                arraySelecionados.splice(arraySelecionados.indexOf(cardEl.dataset.id),1);
                arraySelecionados.splice(arraySelecionados.indexOf(cardEl.dataset.id), 0, cardEl.dataset.id);
              }
                if (preco !== null && arrayValores){
                  if (arrayValores.includes(preco)){
                  arrayValores.splice(arrayValores.indexOf(preco),1);
                } else{
                  arrayValores.push(preco);
                }
                }
                
            }
            check.classList.toggle('active');
            console.log(arraySelecionados, arrayValores);
        })
    })
}
let horaSelecionada = null;
function getHour(){
  horaSelecionada = null;
  const horas = document.querySelectorAll('.resultado-horas span');
  horas.forEach(hora =>{
    const horaEl = hora;
    horaEl.addEventListener('click',function(){
      horas.forEach(h => h.classList.remove('hour-selected'));
      this.classList.add('hour-selected');
      horaSelecionada = this.textContent;
      console.log(horaSelecionada)
    })
  })
}
function renderCards(dados){
    const resultado = document.querySelector('.services-content');
    for (let servico of dados){
        const card = document.createElement('div');
        const textAreaCard = document.createElement('div');
        const img = document.createElement('img');
        const pName = document.createElement('p');
        const pPrice = document.createElement('p');
        const pTime = document.createElement('p');
        const pDescription = document.createElement('p');
        textAreaCard.classList.add('text-card');
        img.classList.add('service-img');
        pDescription.classList.add('service-description')
        pTime.classList.add('service-time');
        pPrice.classList.add('service-price');
        pName.classList.add('service-name');
        card.classList.add('card');
        img.src = servico.imagem;
        pName.innerHTML = servico.nome;
        pTime.innerHTML = `<i data-lucide="clock-3" class="clock"></i>${servico.duracao_min}`;
        pPrice.innerHTML = servico.preco;
        pDescription.innerHTML = servico.descricao;
        card.appendChild(img);
        card.appendChild(textAreaCard);
        textAreaCard.appendChild(pName);
        textAreaCard.appendChild(pPrice);
        textAreaCard.appendChild(pTime);
        textAreaCard.appendChild(pDescription);
        if (resultado){
          resultado.appendChild(card);
        }
    }
    lucide.createIcons();
};
async function loadJson(){
    try{
        const response = await fetch('/static/servicos.json');
        const selecionavel = document.querySelector('.selecionavel')
        dados = await response.json();
        console.log(dados)
        renderCards(dados)
        const servicos = document.querySelectorAll('.card');
        console.log(servicos);
        if(selecionavel){
          selecionarCard(false,servicos, '.service-name', '.service-price', servicosSelecionados, valores );
        }
    } catch(error){
        alert('Verificar console')
        console.error('ERRO: ',error)
    }
    
}
loadJson();
function search(data,e){
    const inputText = e.toLowerCase();
    const search = data.filter(i => i.nome.toLowerCase().includes(inputText));
    document.querySelector('.services-content').innerHTML = '';
    renderCards(search);
  }
  const inputSearch = document.getElementById('searchService');
  if(inputSearch){
    inputSearch.addEventListener('keyup',function(){
        search(dados,inputSearch.value);
        const novosCards = document.querySelectorAll('.card');
        selecionarCard(novosCards);
    })
  }
// CALENDARIO
//CALENDARIO
//CALENDARIO
let diaSelecionado = null;
const resultadoHoras = document.querySelector('.resultado-horas');
function gerarCalendarioSemana() {
  const containerDatas = document.querySelector('.calendar-dates');
  const containerDias = document.querySelector('.calendar-days');
  const nomeMes = document.querySelector('#titulo-mes');
  if (!containerDatas || !containerDias) return;
  containerDatas.innerHTML = '';
  containerDias.innerHTML = '';
  const diasDaSemana = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  diasDaSemana.forEach(dia => {
    const div = document.createElement('div');
    div.classList.add('day-name');
    div.textContent = dia;
    containerDias.appendChild(div);
  });
  const hoje = new Date();
  const diaSemana = hoje.getDay();
  const deslocamento = diaSemana === 0 ? 6 : diaSemana - 1;
  const segunda = new Date(hoje);
  segunda.setDate(hoje.getDate() - deslocamento);
  const nome = segunda.toLocaleString('pt-BR', { month: 'long' });
  nomeMes.textContent = `${nome.charAt(0).toUpperCase() + nome.slice(1)} ${segunda.getFullYear()}`;

  for (let i = 0; i < 7; i++) {
    const dia = new Date(segunda);
    dia.setDate(segunda.getDate() + i);

    const numero = dia.getDate();
    const ano = dia.getFullYear();
    const mes = dia.getMonth() + 1;

    const divDia = document.createElement('div');
    divDia.classList.add('date');
    divDia.textContent = numero;

    // Marcar hoje
    if (
      numero === hoje.getDate() &&
      mes === hoje.getMonth() + 1 &&
      ano === hoje.getFullYear()
    ) {
      divDia.classList.add('hoje');
    }

    // Evento de clique
    divDia.addEventListener('click', () => {
      if (diaSelecionado) {
        diaSelecionado.classList.remove('selecionado');
      }

      divDia.classList.add('selecionado');
      diaSelecionado = divDia;

      dataFormatada = `${ano}-${String(mes).padStart(2, '0')}-${String(numero).padStart(2, '0')}`;

      if (document.querySelector('.calendario-agendamento')) {
        enviarData(dataFormatada);
      } else if (document.querySelector('.calendario-staff')) {
        buscarAgendamento(dataFormatada);
      }
    });

    containerDatas.appendChild(divDia);
  }
}
const verificateCalendar = document.querySelector('.calendar-section');
if (verificateCalendar){
  gerarCalendarioSemana();
}
async function enviarData(diaFormatado) {
        try{
          const csrfToken = getCsrfToken();
          const headers = {
            'Content-Type' : 'application/json',
            'X-CSRFToken' : csrfToken
          }
          const init = {
            method:'POST',
            headers:headers,
            body : JSON.stringify({
              dia:diaFormatado
            })
          }
          const response = await fetch('/horarios/',init);
          if (!response.ok){
            console.error('ERRO HTTP',response.status);
            const erro = await response.json();
            console.error('Detalhes: ',erro);
            return;
          }
          const dados = await response.json();
          console.log(dados.horariosDisponiveis);
          console.log(dados.agendamentos)
          resultadoHoras.innerHTML = '';
          let hora;
          console.log(dados.dia)
          let diaRecebido = dados.dia;
          let diaAtual = getFullDate();
          let horaAtual = getHourNow();
          let listaHorariosVerificados = []; 
          if (dados.folga){
            hora = document.createElement('span');
            hora.innerText = `${dados.mensagem}`;
            resultadoHoras.appendChild(hora);
            return;
          }
          if (dados.dia < diaAtual ){
            console.log(diaRecebido + "___" + diaAtual)
            hora = document.createElement('span');
            hora.innerText = 'Dia inválido';
            resultadoHoras.appendChild(hora);
            return;
          }
          if (diaRecebido === diaAtual) {
            listaHorariosVerificados = dados.horariosDisponiveis.filter(h => h > horaAtual);
          }else {
            listaHorariosVerificados = dados.horariosDisponiveis;
          }
          if (listaHorariosVerificados.length === 0){
            hora = document.createElement('span');
            hora.innerText = 'Sem horários disponíveis';
            resultadoHoras.appendChild(hora);
            return;
          }
          for (let horario of listaHorariosVerificados) {
            let hora = document.createElement('span');
            hora.innerText = horario;
            resultadoHoras.appendChild(hora);
          }
          getHour()

        } catch(error){
          console.error('ERRO: ',error)
        }
      }

async function enviarServico(listaServicos, listaValores){
  try{
    if (listaServicos.length === 0){
      alert('Selecione pelo menos 1 serviço');
      return;
    }
    let valorTotal = 0;
    for (valor of valores){
      valorTotal += valor;
    }
    const csrfToken = getCsrfToken();
    const headers = {
            'Content-Type' : 'application/json',
            'X-CSRFToken' : csrfToken
          }
          const init = {
            method:'POST',
            headers:headers,
            body : JSON.stringify({
              listaServicos:listaServicos,
              valor: valorTotal
            })
          }
    const response = await fetch('/agendamento-segundo-passo/',init);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        alert(`Erro ao enviar serviços. Detalhe: ${errorData.erro || errorData.ERRO || 'Status: ' + response.status}`);
        return;
    }
    const data = await response.json();
    if(data.sucesso && data.redirect_url){
        window.location.href = data.redirect_url;
    } else {
        alert('Resposta inesperada do servidor.');
    }
  } catch(e){
    alert('verificar console, envio do serviço');
    console.log('ERRO:',e);
  }
}
const btnSendService = document.querySelector('.btn-servico');
if(btnSendService){
  btnSendService.addEventListener('click',()=>{
    enviarServico(servicosSelecionados,valores);
  })
}
async function sendHour() {
  console.log(horaSelecionada)
  try{
    if (!horaSelecionada){
      alert('Selecione um horário');
      return;
    }
    const csrfToken = getCsrfToken();
    const headers = {
            'Content-Type' : 'application/json',
            'X-CSRFToken' : csrfToken
          }
          const init = {
            method:'POST',
            headers:headers,
            body : JSON.stringify({
              horaSelecionada:horaSelecionada
            })
          }
    const response = await fetch('/agendamento-terceiro-passo/',init);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        alert(`Erro ao enviar horário. Detalhe: ${errorData.erro || errorData.ERRO || 'Status: ' + response.status}`);
        return;
    }
    const data = await response.json();
    if(data.sucesso && data.redirect_url){
        window.location.href = data.redirect_url;
    } else {
        alert('Resposta inesperada do servidor.');
    }
  } catch(error){
    alert('ERRO ao enviar hora');
    console.log('ERRO ao enviar hora: ',error)
  }
}
const btnSendHour = document.querySelector('.btn-horario');
if(btnSendHour){
  btnSendHour.addEventListener('click',()=>{
    sendHour();
  })
}

function getResumo(){
  const dados = JSON.parse(document.getElementById("jsonResumo").textContent);
  const cardResumo = document.querySelector('.card-resumo');
  for (let k in dados){
    const p = document.createElement('p');
    p.innerText = `${k}: ${dados[k]}`
    cardResumo.appendChild(p);
  }
  return dados
}
async function sendAgendamento(){
  try{
    const csrfToken = getCsrfToken();
    const headers = {
            'Content-Type' : 'application/json',
            'X-CSRFToken' : csrfToken
          }
          const init = {
            method:'POST',
            headers:headers,
            body: JSON.stringify({})
          }
    const response = await fetch('/agendar/',init);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        alert(`Erro ao enviar horário. Detalhe: ${errorData.erro || errorData.ERRO || 'Status: ' + response.status}`);
        return;
    }
    const data = await response.json();
    if (!data.sucesso){
      document.querySelector('.errorForm').textContent = data.mensagem;
      if(data.redirect_url){
        window.location.href = data.redirect_url;
      }
      return
    }
    if (data.redirect_url) {
        window.location.href = data.redirect_url;
    }
  } catch(error){
    alert('Erro ao enviar agendamento');
    console.log('ERRO ao enviar agendamento',error);
  }
}
function atualizarListaAgendamentos(agendamentos,elemento) {
  const container = document.querySelector(`.${elemento}`);
    container.innerHTML = "";

    if (!agendamentos || agendamentos.length === 0) {
        container.innerHTML = `<p style="text-align:center;margin-top:30px;padding:5px 10px;border-radius:7px;border:1px solid #EFE5AD">Não há agendamentos para este dia.</p>`;
        return;
    }

    agendamentos.forEach(a => {
        const card = document.createElement("div");
        card.classList.add("card-agendamento");

        card.innerHTML = `
            <div class="card-body">
              <p><strong>Barbeiro:</strong> ${a.barbeiro ?? "—"}</p>
                <p><strong>Usuário:</strong> ${a.usuario ?? "—"}</p>
                <p><strong>Serviço:</strong> ${a.servico}</p>
                <p><strong>Status:</strong> ${a.status ?? "—"}</p>
                <p><strong>Valor:</strong> ${a.valor !== null ? "R$ " + a.valor.toFixed(2) : "—"}</p>
            </div>
        `;

        container.appendChild(card);
    });
}

async function buscarAgendamento(diaFormatado){
  try{
    const csrfToken = getCsrfToken();
    const headers = {
      'Content-Type' : 'application/json',
      'X-CSRFToken' : csrfToken
    }
    const init = {
      method:'POST',
      headers:headers,
      body : JSON.stringify({
        dia:diaFormatado
      })
    }
    const response = await fetch('perfil/buscar-agendamento/',init)
    if (!response.ok) {
      console.log("Erro na resposta do servidor");
      return;
    }
    const data = await response.json();
    console.log("Agendamentos recebidos:", data)
    atualizarListaAgendamentos(data.agendamentos,"res-agendamentos");
    } catch(error){
    alert('Erro na função buscar agendamento');
    console.log(error);
  }
}
const verificateResumo = document.querySelector('.verificateResumo');
if (verificateResumo){
  console.log(getResumo())
}

const btnEnviar = document.querySelector('.btn-enviar-agendamento');
if(btnEnviar){
  btnEnviar.addEventListener('click',() => {
    sendAgendamento();
  })
}
const eye = document.querySelector('.eye');
if (eye) {
  // Começa como fechado
  eye.classList.add('fechado');
  eye.innerHTML = '<i data-lucide="eye-off"></i>';
  lucide.createIcons();

  eye.addEventListener('click', () => {

    const isClosed = eye.classList.contains('fechado');

    if (isClosed) {
      eye.classList.remove('fechado');
      eye.classList.add('aberto');
      eye.innerHTML = '<i data-lucide="eye"></i>';
      lucide.createIcons();
      document.querySelector('.senha').type = 'text';

    } else {
      eye.classList.remove('aberto');
      eye.classList.add('fechado');

      eye.innerHTML = '<i data-lucide="eye-off"></i>';
      lucide.createIcons();

      document.querySelector('.senha').type = 'password';
    }
  });
}
const forms = document.querySelectorAll('.formLogin');
forms.forEach(form => {
  const usernameInput = form.querySelector('.usernameInput');
  const passInput = form.querySelector('.passInput');
  const emailInput = form.querySelector('.emailInput');
  const sendFormbtn = form.querySelector('.sendForm');
  const dataFolga= form.querySelector('.dataFolga');
  const motivoFolga = form.querySelector('.motivoFolga')
  const listaObrigatoria = document.querySelector('.listaObrig');
  if (listaObrigatoria){
      const itens = listaObrigatoria.querySelectorAll('.itemLista');
      itens.forEach(item => {
        item.style.color = 'red';
        if (passInput){
        passInput.addEventListener('keyup',function() {
          const senhaValue = passInput.value
          if (item.classList.contains('caracter')){
            if (senhaValue.trim().length >= 8) item.style.color = 'green';
            else item.style.color = 'red'
          };
          if (item.classList.contains('umNum')){
            if (/\d/.test(senhaValue)) item.style.color = 'green';
            else item.style.color = 'red';
          };
          if (item.classList.contains('umL')){
            if (/[A-Z]/.test(senhaValue)) item.style.color = 'green';
            else item.style.color = 'red';
          };
          if (item.classList.contains('especial')){
            if (/[^A-Za-z0-9]/.test(senhaValue)) item.style.color = 'green';
            else item.style.color = 'red';
          };
        })
      }
      });
  };
  form.addEventListener('submit', e =>{
    let erro = false;
    if (usernameInput && usernameInput.value.trim() === '') erro = true;
    if (passInput && passInput.value.trim() === '') erro = true;
    if (emailInput && emailInput.value.trim() === '') erro = true;
    if (dataFolga && dataFolga.value.trim() === '') erro = true;
    if (motivoFolga && motivoFolga.value.trim() === '') erro = true;
    if (passInput){
      const senhaValue = passInput.value
      const regrasSenhaInvalidas = [
        senhaValue.length < 8,
        !/\d/.test(senhaValue),
        !/[A-Z]/.test(senhaValue),
        !/[^A-Za-z0-9]/.test(senhaValue)
      ];
      let erroSenha = false;
      if (regrasSenhaInvalidas.some(r => r)) erroSenha = true;
  }
    if (erro){
      verificarErro('Todos os campos devem ser preenchidos',form,e,sendFormbtn)
      return;
    }
    if (erroSenha){
      verificarErro('Verifique sua senha',form,e,sendFormbtn)
      return;
    }
  })
});
function verificarErro(msg,form,e,sendFormbtn){
  e.preventDefault();
  const errorExists = form.querySelector('.errorForm');
  if (errorExists) errorExists.remove();
  const span = document.createElement('span');
  span.classList.add('errorForm');
  span.innerHTML = `<i data-lucide="circle-x" style="color:red;width:20px;height:20px;"></i> ${msg}`;
  sendFormbtn.before(span);
  lucide.createIcons();
}
async function cancelarAgendamento(id) {
  try{
    const csrfToken = getCsrfToken();
    const headers = {
      'Content-Type' : 'application/json',
      'X-CSRFToken' : csrfToken
    }
    const init = {
      method:'POST',
      headers:headers,
      body : JSON.stringify({ id })
    }
    const response = await fetch(`/perfil/agendamento/cancelar/${id}/`, init);
    const data = await response.json();
    if (data.status === 'ok'){
      if (data.redirect_url) {
        window.location.href = data.redirect_url;
      }
    }
  } catch(e){

  }
}
let tipoCancelamento = null;
let tipoid=null;
const textoDialog = document.querySelector('.confirm-text');
const dialog = document.getElementById('confirm-dialog');

function abrirConfirmacao(id) {
  tipoid = id;
  tipoCancelamento = 'agendamento';
  textoDialog.textContent = 'Deseja cancelar o agendamento?';
  dialog.showModal();
}

const btnConfirmar = document.getElementById('confirmar')
const btnFechar= document.getElementById('fechar')
if (btnConfirmar && btnFechar){
  document.getElementById('fechar').onclick = () => dialog.close();
  document.getElementById('confirmar').onclick = () => {
    if (tipoCancelamento === 'agendamento'){
      cancelarAgendamento(tipoid);
    } else if (tipoCancelamento === 'folga'){
      cancelarFolga(tipoid);
    }
    else if (tipoCancelamento === 'func'){
      demitir(tipoid);
    }
    dialog.close();
  };
}
function abrirConfirmacaoFolgas(id) {
  tipoid = id;
  tipoCancelamento = 'folga';
  textoDialog.textContent = 'Deseja cancelar a folga?';
  dialog.showModal();
}
const dialogFunc = document.querySelector('.confirm-dialog-func');
function abrirConfirmacaoFunc(id) {
  tipoid = id;
  tipoCancelamento = 'func';
  textoDialog.textContent = 'Deseja demitir Este funcionário?';
  dialog.showModal();
}
async function cancelarFolga(id) {
  try{
    const csrfToken = getCsrfToken();
    const headers = {
      'Content-Type' : 'application/json',
      'X-CSRFToken' : csrfToken
    }
    const init = {
      method:'POST',
      headers:headers,
      body : JSON.stringify({ id })
    }
    const response = await fetch(`/perfil/folga/cancelar/${id}/`, init);
    const data = await response.json();
    if (data.status === 'ok'){
      if (data.redirect_url) {
        window.location.href = data.redirect_url;
      }
    }
  } catch(e){
    console.log(e)
  }
}
function atualizarListaFolgas(folgas,elemento) {
  const container = document.querySelector(`.${elemento}`);
    container.innerHTML = "";
    if (!folgas || folgas.length === 0) {
        container.innerHTML = `<p style="text-align:center;">Não há folgas a partir de hoje.</p>`;
        return;
    }
    folgas.forEach(a => {
        const card = document.createElement("div");
        card.classList.add("card-agendamento");
        card.innerHTML = `
            <div class="card-body">
                <p><strong>Barbeiro:</strong> ${a.func}</p>
                <p><strong>Data:</strong> ${a.data ?? "—"}</p>
                <p><strong>Motivo:</strong> ${a.motivo}</p>
                <div class="card-acoes">
                    <button class="btn-cancelar" style="border: none;cursor:pointer;width:100%;" onclick="abrirConfirmacaoFolgas(${a.id})">Cancelar</button>
                </div>
            </div>
        `;

        container.appendChild(card);
    });
}
async function buscarFolgas() {
  try{
    const csrfToken = getCsrfToken();
    const headers = {
      'Content-Type' : 'application/json',
      'X-CSRFToken' : csrfToken
    }
    const init = {
      method:'POST',
      headers:headers,
    }
    const response = await fetch('ver-folgas/',init);
    if (!response.ok) {
      console.log("Erro na resposta do servidor");
      return;
    }
    const data = await response.json();
    atualizarListaFolgas(data.folgas,"res-folgas")
  } catch(e){
    alert('Erro na função de buscarFolgas');
    console.log('Erro na função de buscar folgas: ',e);
  }
}

const verFolgasbtn = document.querySelector('.verFolgas');
if(verFolgasbtn){
  verFolgasbtn.addEventListener('click',()=>{
    buscarFolgas();
  })
}

const fecharFolgasbtn = document.querySelector('.fecharFolgas');
if (fecharFolgasbtn){
  fecharFolgasbtn.addEventListener('click',()=>{
    fecharFolgasbtn.classList.toggle('clicked');
    if (fecharFolgasbtn.classList.contains('clicked')){
      document.querySelector('.res-folgas').style.display = 'none';
      fecharFolgasbtn.textContent = 'Abrir folgas';
    } else {
      document.querySelector('.res-folgas').style.display = 'block';
      fecharFolgasbtn.textContent = 'Fechar folgas';
    }
  })
}

async function carregarExpediente(){
  try{
    const csrfToken = getCsrfToken();
    const headers = {
      'Content-Type' : 'application/json',
      'X-CSRFToken' : csrfToken
    }
    const init = {
      method:'POST',
      headers:headers,
    }
    const response = await fetch('ver-expediente/',init);
    const data = await response.json();
    console.log(data.conteudo)
    atualizarListaExpediente(data.conteudo);
  } catch(e){
    alert('ERRO na função de expediente');
    console.log('Erro de navegador: ',e, 'Erro de server');
  }
}
function agruparPorBarbeiro(data) {
  return data.reduce((acc, ex) => {
    if (!acc[ex.barbeiro]) {
      acc[ex.barbeiro] = [];
    }
    acc[ex.barbeiro].push(ex);
    return acc;
  }, {});
}
function atualizarListaExpediente(data){
  const container = document.querySelector('.tabela-expedientes');
  container.innerHTML = '';

  if(!data || data.length === 0){
    container.innerHTML = 'Sem expediente ainda';
    return;
  }

  const expedientesPorBarbeiro = agruparPorBarbeiro(data);

  Object.keys(expedientesPorBarbeiro).forEach(nomeBarbeiro => {

    // TÍTULO DO BARBEIRO
    const titulo = document.createElement('h3');
    titulo.textContent = nomeBarbeiro;
    container.appendChild(titulo);

    // CRIA TABELA
    const tabela = document.createElement('table');
    tabela.classList.add('tabela-expediente');

    // THEAD
    const thead = document.createElement('thead');
    const trThead = document.createElement('tr');
    trThead.innerHTML = `
      <th>Dia</th>
      <th>Início</th>
      <th>Fim</th>
      <th>Almoço</th>
      <th>Fim de almoço</th>
      <th>Intervalo</th>
    `;
    thead.appendChild(trThead);
    tabela.appendChild(thead);

    // TBODY
    const tbody = document.createElement('tbody');

    expedientesPorBarbeiro[nomeBarbeiro].forEach(ex => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${ex.dia_semana}</td>
        <td>${ex.hora_inicio}</td>
        <td>${ex.hora_fim}</td>
        <td>${ex.almoco_inicio === null ? 'sem almoço' : ex.almoco_inicio}</td>
        <td>${ex.almoco_fim === null ? 'sem almoço' : ex.almoco_fim}</td>
        <td>${ex.intervalo} minutos</td>
      `;
      tbody.appendChild(tr);
    });

    tabela.appendChild(tbody);
    container.appendChild(tabela);
  });
}

const verExbtn = document.querySelector('.verEx');
if (verExbtn){
  verExbtn.addEventListener('click',()=>{
    carregarExpediente();
    document.querySelector('.tabela-expedientes').style.display = 'block';
  })
}

const fecharExpedientebtn = document.querySelector('.fecharEx');
if (fecharExpedientebtn){
  fecharExpedientebtn.addEventListener('click',()=>{
    fecharExpedientebtn.classList.toggle('clicked');
    if (fecharExpedientebtn.classList.contains('clicked')){
      document.querySelector('.tabela-expedientes').style.display = 'none';
      fecharExpedientebtn.textContent = 'Abrir Expediente';
    } else {
      document.querySelector('.tabela-expedientes').style.display = 'block';
      fecharExpedientebtn.textContent = 'Fechar Expediente';
    }
  })
}

const inputFile = document.getElementById('fotoBarbeiro');
const fileText = document.getElementById('file-text');
if (inputFile){
  inputFile.addEventListener('change',function(){
    const files = this.files[0];
    if (!files) return;
    const maxSizeMB = 4;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (files.size > maxSizeBytes){
      alert('A imagem deve ter no máximo 2MB');
      return;
    }
    if (inputFile.files.length > 0){
      fileText.textContent = inputFile.files[0].name
    } else {
      fileText.textContent = 'Selecionar arquivo';
    }
  })
}

async function acessarBarbeiros(){
  try{
    const csrfToken = getCsrfToken();
    const headers = {
      'Content-Type' : 'application/json',
      'X-CSRFToken' : csrfToken
    }
    const init = {
      method:'POST',
      headers:headers,
    }
    const response = await fetch('ver-func/',init);
    if (!response.ok){
      console.log('Erro de resposta do servidor');
      return;
    }
    const data = await response.json();
    atualizarListaFunc(data.conteudo);
  } catch(e){
    alert('Erro na função de buscar barbeiros');
    console.log(e);
  }
}

function atualizarListaFunc(data){
  const area = document.querySelector('.res-barber');
  area.innerHTML = '';
  if(!data || data.length === 0){
    area.innerHTML = `<p>Sem funcionários</p>`;
  }
  data.forEach(func =>{
    const card = document.createElement("div");
    card.classList.add("card");
    card.innerHTML = `
        <div class="card-body card-func" style="display:flex;flex-direction:column;margin: 0 auto 0 auto;gap:10px;">
          <div class="content">
              <div class="foto">
                <img src="${func.img}" alt="sem foto"></img>
              </div>
              <div class="text">
                <p><strong>ID:</strong>${func.id}</p>
                <p><strong>Nome:</strong> ${func.nome}</p>
                <p style="word-break:break-word;overflow-wrap:break-word;"><strong>Email:</strong>${func.email}</p>
              </div>
          </div>
            <div class="card-acoes">
                <button class="btn-cancelar" style="border: none;cursor:pointer;width:100%;" onclick="abrirConfirmacaoFunc(${func.id})">Demitir</button>
            </div>
        </div>
    `;

    area.appendChild(card);
  })
}
const funcBtn = document.querySelector('.verBarbeiros');
if(funcBtn){
  funcBtn.addEventListener('click',()=>{
    document.querySelector('.res-barber').style.display = 'block';
    acessarBarbeiros();
  })
}
const fecharFuncbtn = document.querySelector('.fecharBarbeiros')
if (fecharFuncbtn){
  fecharFuncbtn.addEventListener('click',()=>{
    fecharFuncbtn.classList.toggle('clicked');
    if (fecharFuncbtn.classList.contains('clicked')){
      document.querySelector('.res-barber').style.display = 'none';
      fecharFuncbtn.textContent = 'Abrir Expediente';
    } else {
      document.querySelector('.res-barber').style.display = 'block';
      fecharFuncbtn.textContent = 'Fechar Expediente';
    }
  })
}

async function demitir(id){
  try{
    const csrfToken = getCsrfToken();
    const headers = {
      'Content-Type' : 'application/json',
      'X-CSRFToken' : csrfToken
    }
    const init = {
      method:'POST',
      headers:headers,
      body : JSON.stringify({ id })
    }
    const response = await fetch(`/perfil/demitir/${id}/`,init);
    const data = await response.json();
    if (data.status === 'ok'){
      if (data.redirect_url) {
        window.location.href = data.redirect_url;
      }
    }
  } catch(e){
    alert('Erro na função de demitir');
    console.log(e);
  }
}
let barbeirosSelecionados = [];
const cardsBarbeiros = document.querySelectorAll('.card-barbeiros');
if(cardsBarbeiros){
  selecionarCard(true,cardsBarbeiros,'.barbeiro-nome',null,barbeirosSelecionados);
}
async function enviarBarbeiro(listaBarbeiro){
  try{
    let barbeiros = listaBarbeiro;
    if(barbeiros.length === 0 ){
      alert('Selecione ao menos um barbeiro');
      return
    }
    let barbeiroId = barbeiros[0];
    
    const csrfToken = getCsrfToken();
    const headers = {
            'Content-Type' : 'application/json',
            'X-CSRFToken' : csrfToken
          }
    const init = {
      method:'POST',
      headers:headers,
      body : JSON.stringify({
        barbeiroId: barbeiroId,
      })
    }
    const response = await fetch('/enviar-func/',init);
    const data = await response.json();
    if(data.redirect_url){
      window.location.href = data.redirect_url;
    }
    console.log(barbeiroId);
  }catch(e){
    alert('Erro ao enviar barbeiro');
    console.log(e);
  }
}
const btnEnviarFunc = document.querySelector('.btn-func');
if(btnEnviarFunc){
  btnEnviarFunc.addEventListener('click',()=>{
    enviarBarbeiro(barbeirosSelecionados);
  })
}