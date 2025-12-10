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
let dataAtual = new Date()  ;
let mesAtual = dataAtual.getMonth();
let anoAtual = dataAtual.getFullYear();
let diaSelecionado = null;
let dataFormatada = null;
const resultadoHoras = document.querySelector('.resultado-horas');
function gerarCalendario(mes, ano) {
  const containerDatas = document.querySelector('.calendar-dates');
  const containerDias = document.querySelector('.calendar-days');
  const nomeMes = document.querySelector('#titulo-mes');
  const diaSemanaEl = document.querySelector('#dia-semana');
  const diaMesEl = document.querySelector('#dia-mes');
  if(containerDatas && containerDias){
    containerDatas.innerHTML = '';
    containerDias.innerHTML = '';
  }

  const diasDaSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  diasDaSemana.forEach(dia => {
    const div = document.createElement('div');
    div.classList.add('day-name');
    div.textContent = dia;
    containerDias.appendChild(div);
  });

  const dataHoje = new Date();
  const primeiroDiaSemana = new Date(ano, mes, 1).getDay();
  const totalDiasMes = new Date(ano, mes + 1, 0).getDate();
  const totalDiasMesAnterior = new Date(ano, mes, 0).getDate();

  const nome = new Date(ano, mes).toLocaleString('pt-BR', { month: 'long' });
  nomeMes.textContent = `${nome.charAt(0).toUpperCase() + nome.slice(1)} ${ano}`;

  const diasAnteriores = primeiroDiaSemana;
  for (let i = diasAnteriores; i > 0; i--) {
    const dia = totalDiasMesAnterior - i + 1;
    const div = document.createElement('div');
    div.classList.add('date', 'fora-do-mes');
    div.textContent = dia;
    containerDatas.appendChild(div);
  }

  for (let dia = 1; dia <= totalDiasMes; dia++) {
    const divDia = document.createElement('div');
    divDia.classList.add('date');
    divDia.textContent = dia;

    // Marcar o dia de hoje
    if (
      dia === dataHoje.getDate() &&
      mes === dataHoje.getMonth() &&
      ano === dataHoje.getFullYear()
    ) {
      divDia.classList.add('hoje');
    }

    // Adicionar evento de clique
    divDia.addEventListener('click', () => {
      // Remover destaque do dia anterior
      if (diaSelecionado) {
        diaSelecionado.classList.remove('selecionado');
      }

      // Adicionar destaque ao novo dia
      divDia.classList.add('selecionado');
      diaSelecionado = divDia;
      dataFormatada = `${ano}-${String(mes+1).padStart(2,'0')}-${String(dia).padStart(2,'0')}`;
      enviarData(dataFormatada);
    });

    containerDatas.appendChild(divDia);
  }

  const totalCelas = diasAnteriores + totalDiasMes;
  const celulasNecessarias = Math.ceil(totalCelas / 7) * 7;
  const diasSeguinte = celulasNecessarias - totalCelas;

  for (let i = 1; i <= diasSeguinte; i++) {
    const div = document.createElement('div');
    div.classList.add('date', 'fora-do-mes');
    div.textContent = i;
    containerDatas.appendChild(div);
  }
}

function mesAnterior() {
  mesAtual--;
  if (mesAtual < 0) {
    mesAtual = 11;
    anoAtual--;
  }
  diaSelecionado = null; // limpa seleção
  gerarCalendario(mesAtual, anoAtual);
}

function proximoMes() {
  mesAtual++;
  if (mesAtual > 11) {
    mesAtual = 0;
    anoAtual++;
  }
  diaSelecionado = null;
  gerarCalendario(mesAtual, anoAtual);
}
const verificateCalendar = document.querySelector('.calendar-section');
if (verificateCalendar){
  gerarCalendario(mesAtual, anoAtual);
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
    const telefone = document.querySelector('.foneUser').value;
    let telefoneLimpo = telefone.replace(/[^a-zA-Z0-9]/g, '');
    if(!telefone){
      alert('Escreva seu numero de telefone');
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
              userTelefone:telefoneLimpo
            })
          }
    const response = await fetch('/agendar/',init);
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
    alert('Erro ao enviar agendamento');
    console.log('ERRO ao enviar agendamento',error);
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