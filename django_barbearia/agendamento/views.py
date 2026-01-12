from django.shortcuts import render,redirect
from django.urls import reverse
import json
from django.http import JsonResponse, HttpResponse
from .models import Agendamentos
from datetime import datetime, time
from django.utils import timezone
from login.models import Folga, Expediente, Barbeiro
from login.views import gerar_horarios
from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db import IntegrityError
# Create your views here.

def index(request):
    return render(request,'index.html')
def receberFunc(request):
    if request.method != 'POST':
        messages.error(request,'Método inválido')
        return render(request, 'index.html')
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
        except:
            return JsonResponse({'erro':'corpo da requisição inválido'})
        barbeiroId = data.get('barbeiroId')
        request.session['barbeiroId'] = barbeiroId
        request.session.save()
        return JsonResponse({'sucesso': True, 'redirect_url': reverse('agendamento')})
def verificarHorarios(request):
    if request.method != 'POST':
        return JsonResponse({'ERRO':'Método não permitido'},status=405)
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'erro':'Corpo da requisição inválido'}, status=400)
    dia = data.get('dia')
    barbeiroId = request.session.get('barbeiroId')
    if not dia:
        return JsonResponse({'ERRO' : 'Dia não recebido'})
    if not barbeiroId:
        return JsonResponse({'ERRO': 'Barbeiro não selecionado'},status=400)
    
    request.session["diaAgendamento"] = dia
    request.session.save()
    print('Dia escolhido')
    print(request.session.get('diaAgendamento'))
    data_obj = datetime.strptime(dia, "%Y-%m-%d").date()
    try:
        barbeiro = Barbeiro.objects.get(id=barbeiroId)
    except Barbeiro.DoesNotExist:
        return JsonResponse({'ERRO':'Barbeiro inválido'},status=400)
    if Folga.objects.filter(barbeiro=barbeiro,data=data_obj).exists():
        return JsonResponse({
            'dia': dia,
            'folga': True,
            'horariosDisponiveis': [],
            'mensagem': 'Este barbeiro não atende nesta data'
        })
    diaSemanaParaBanco = data_obj.weekday()
    expedienteExiste = Expediente.objects.filter(barbeiro=barbeiro,dia_semana=diaSemanaParaBanco).exists()
    if not expedienteExiste:
        horarios = []
        return JsonResponse({"horariosDisponiveis" : horarios})
    expediente = Expediente.objects.filter(barbeiro=barbeiro,dia_semana=diaSemanaParaBanco).first()
    if not expediente:
        return JsonResponse({'ERRO':'sem expediente válido'})
    horarios = gerar_horarios(expediente.hora_inicio, expediente.hora_fim,expediente.intervalo,expediente.almoco_inicio,expediente.almoco_fim)

    diaSemana = data_obj.strftime("%A")
    inicio = datetime.combine(data_obj, time.min)
    fim = datetime.combine(data_obj, time.max)
    agendamentos = Agendamentos.objects.filter(barbeiro=barbeiro,data__range=(inicio, fim))
    lista_agendamentos = [
        {
            'id': ag.id,    
            'hora': ag.data.strftime('%H:%M'),
            'status': ag.status,
            'servico':ag.servico
        }
        for ag in agendamentos
    ]
    horariosOcupados = [ag['hora'] for ag in lista_agendamentos]
    disponiveis = [h for h in horarios if h not in horariosOcupados]
    return JsonResponse({
        'dia': dia,
        'agendamentos':lista_agendamentos,
        'horariosDisponiveis' : disponiveis
        })

def renderAgendamentoFirst(request):
    return render(request,'agendamento_1.html')


def renderAgendamentoSecond(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
        except:
            return JsonResponse({'erro':'Corpo da requisição inválido'}, status=400)
        
        listaServico = data.get('listaServicos')
        valorTotal = data.get('valor')
        
        if not listaServico:
            return JsonResponse({'erro': 'Lista de serviços não fornecida'}, status=400)

        request.session["servicos_escolhidos"] = listaServico
        request.session.save()
        request.session["valorServicos"] = valorTotal
        request.session.save()
        print(request.session.get("servicos_escolhidos"))
        print(request.session.get("valorServicos"))

        return JsonResponse({'sucesso': True, 'redirect_url': reverse('segundoAgendamento')})

    elif request.method == 'GET':
        if "servicos_escolhidos" not in request.session:
            return redirect('segundoAgendamento')
        
        return render(request, 'agendamento_2.html')

    return JsonResponse({'ERRO':'Método não permitido'},status=405)
def renderAgendamentoThird(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
        except:
            return JsonResponse({'erro':'Corpo da requisição inválido'}, status=400)
        hora = data.get('horaSelecionada')
        if not hora:
            return JsonResponse({'erro':'Horario não fornecido'},status=400)
        request.session["horaEscolhida"] = hora
        request.session.save()
        print(request.session.get("horaEscolhida"))
        return JsonResponse({'sucesso': True, 'redirect_url': reverse('terceiroAgendamento')})
    elif request.method == 'GET':
        if "horaEscolhida" not in request.session:
            return redirect('terceiroAgendamento')
        dia = request.session.get('diaAgendamento')
        hora = request.session.get('horaEscolhida')
        servico = request.session.get('servicos_escolhidos',[])
        valor = request.session.get('valorServicos')
        dados_json = {
            "Dia" : dia,
            "Hora" : hora,
            "Servico" : servico,
            "Total" : f"R$ {valor}"
        }
        print(dados_json)
        return render(request, 'resumo.html',{'dados_json' : json.dumps(dados_json)})
    return JsonResponse({'ERRO':'Método não permitido'},status=405)
def agendar(request):
    if request.method == 'POST':
        if not request.user.is_authenticated:
            messages.error(request, "Você deve fazer login para prosseguir com o agendamento")
            return JsonResponse({
            'sucesso': False,
            'mensagem': "Você deve fazer login para fazer o agendamento.",
            'redirect_url': reverse('login') 
            })
        dia = request.session.get('diaAgendamento')
        hora = request.session.get('horaEscolhida')
        data_agendada = datetime.strptime(f"{dia} {hora}", "%Y-%m-%d %H:%M")
        servico = request.session.get('servicos_escolhidos',[])
        valor = request.session.get('valorServicos')
        barbeiroId = request.session.get('barbeiroId')
        try:
            barbeiro = Barbeiro.objects.get(id=barbeiroId)
        except Barbeiro.DoesNotExist:
            return JsonResponse({'ERRO':'Barbeiro inválido'},status=400)
        try:
            ag = Agendamentos.objects.create(
                usuario=request.user,
                data=data_agendada,
                servico=", ".join(servico),
                status='confirmado',
                valor=valor,
                barbeiro=barbeiro,
            )
        except IntegrityError:
            return JsonResponse({
            'ERRO': 'Esse horário acabou de ser ocupado'
            }, status=409)
        return JsonResponse({'sucesso': True, 'redirect_url': reverse('agendar')})
    return render(request, 'success.html')

def verFunc(request):
    if request.method != 'POST':
        barbeiros = Barbeiro.objects.select_related('user').all()
        return render(request, 'funcionarios.html', {
            'barbeiros' : barbeiros
        })
    
