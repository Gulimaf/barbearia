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
function selecionarCard(array){
    array.forEach(function(card){
        const cardEl = card;
        cardEl.addEventListener('click',function(){
            const nome = cardEl.querySelector('.service-name').textContent;
            const preco = Number(cardEl.querySelector('.service-price').textContent.slice(0,2));
            let check = cardEl.querySelector('.check-container');
            if (!check){
                check = document.createElement('p');
                check.innerHTML = '<i data-lucide="check"></i>';
                check.classList.add('check-container');
                cardEl.appendChild(check);
                lucide.createIcons();
            }
            if(check){
                if (servicosSelecionados.includes(nome)){
                    servicosSelecionados.splice(servicosSelecionados.indexOf(nome),1);
                }
                else{
                    servicosSelecionados.push(nome);
                }
                if (valores.includes(preco)){
                  valores.splice(valores.indexOf(preco),1);
                } else{
                  valores.push(preco);
                }
            }
            check.classList.toggle('active');
            console.log(servicosSelecionados,valores)
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
          selecionarCard(servicos);
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
function atualizarListaAgendamentos(agendamentos) {
  const container = document.getElementById("listaAgendamentos");
    container.innerHTML = "";

    if (!agendamentos || agendamentos.length === 0) {
        container.innerHTML = `<p>Não há agendamentos para este dia.</p>`;
        return;
    }

    agendamentos.forEach(a => {
        const card = document.createElement("div");
        card.classList.add("card-agendamento");

        card.innerHTML = `
            <div class="card-header">
                <strong>${a.data}</strong>
            </div>
            <div class="card-body">
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
    atualizarListaAgendamentos(data.agendamentos);
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
  const listaObrigatoria = document.querySelector('.listaObrig');
  if (listaObrigatoria){
      const itens = listaObrigatoria.querySelectorAll('.itemLista');
      itens.forEach(item => {
        item.style.color = 'red';
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
      });
  };
  form.addEventListener('submit', e =>{
    let erro = false;
    if (usernameInput && usernameInput.value.trim() === '') erro = true;
    if (passInput && passInput.value.trim() === '') erro = true;
    if (emailInput && emailInput.value.trim() === '') erro = true;
    const senhaValue = passInput.value
    const regrasSenhaInvalidas = [
      senhaValue.length < 8,
      !/\d/.test(senhaValue),
      !/[A-Z]/.test(senhaValue),
      !/[^A-Za-z0-9]/.test(senhaValue)
    ];
    let erroSenha = false;
    if (regrasSenhaInvalidas.some(r => r)) erroSenha = true;
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
  span.innerHTML = msg; 
  sendFormbtn.before(span);
}
const btnCancelar = document.querySelector('.btn-cancelar');
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
    const response = await fetch(`/perfil/agendamento/cancelar/${id}/`, init)
    const data = await response.json();
    if (data.status === 'ok'){
      if (data.redirect_url) {
        window.location.href = data.redirect_url;
      }
    }
  } catch(e){

  }
}
let agendamentoId = null;
const dialog = document.getElementById('confirm-dialog');

function abrirConfirmacao(id) {
  agendamentoId = id;
  dialog.showModal();
}

const btnConfirmar = document.getElementById('confirmar')
const btnFechar= document.getElementById('fechar')
if (btnConfirmar && btnFechar){
  document.getElementById('fechar').onclick = () => dialog.close();

document.getElementById('confirmar').onclick = () => {
  cancelarAgendamento(agendamentoId);
  dialog.close();
};
}
