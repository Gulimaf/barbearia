from django.shortcuts import render,redirect, get_object_or_404
from django.urls import reverse
import json
from django.http import JsonResponse, HttpResponse
from django.contrib.auth import authenticate,login,logout
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from login.utils.token_generator import token_generator
from django.utils.safestring import mark_safe
from agendamento.models import Agendamentos
from datetime import datetime,date,time
from .models import Folga, Expediente, Barbeiro
from django.forms.models import model_to_dict
from PIL import Image
import os
from django.conf import settings
# Create your views here.



def cadastroPage(request):
    return render(request, 'cadastro.html')
def loginPage(request):
    return render(request, 'login.html')
def cadastro(request):
    if request.method == 'GET':
        return render(request, 'cadastro.html')
    else:
        username = request.POST.get('usernameUsuario')
        email = request.POST.get('emailUsuario')
        senha = request.POST.get('senhaUsuario')

        user = User.objects.filter(username=username).exists()
        emailUser = User.objects.filter(email=email).exists()
        if user:
            messages.error(request,'Nome de usuário inválido')
            return render(request, 'cadastro.html')
        if emailUser:
            login_url = reverse('login')
            messages.error(request,mark_safe(f'Já existe uma conta com esse email. <a href="{login_url}">Fazer login</a>'))
            return render(request, 'cadastro.html')
        user = User.objects.create_user(
            username=username,
            email=email,
            password=senha
        )
        user.is_active = False
        user.save()
        token = token_generator.make_token(user)
        link = request.build_absolute_uri(f"/perfil/confirmar-email/{user.pk}/{token}/")
        sendEmail(assunto="Confirme seu cadastro",
            destinatario=email,
            texto="Clique no botão abaixo para confirmar seu cadastro:",
            texto_botao="Confirmar e-mail",
            link_botao=link)
        messages.success(request,'verifique seu email para ativar a conta')
        return render(request, 'cadastro.html')
    
def cadastroBarbeiro(request):
    if request.method == 'GET':
        return redirect('homePerfil')
    username = request.POST.get('usernameUsuario')
    email = request.POST.get('emailUsuario')
    senha = request.POST.get('senhaUsuario')
    foto = request.FILES.get('fotoBarbeiro')
    print(foto)
    if User.objects.filter(username=username).exists():
        messages.error(request,'Ja existe barbeiro com esse nome')
        return redirect('homePerfil')
    if User.objects.filter(email=email).exists():
        messages.error(request,'Ja existe barbeiro com esse email')
        return redirect('homePerfil')
    user = User.objects.create_user(
            username=username,
            email=email,
            password=senha
        )
    user.is_active = True
    user.save()
    barbeiro = Barbeiro.objects.create(
        user=user,
        foto=foto
    )
    messages.success(request, 'Barbeiro cadastrado com sucesso')
    return redirect('homePerfil')
    
def entrar(request):
    if request.method == 'GET':
        return render(request, 'login.html')
    username = request.POST.get('username')
    senha = request.POST.get('senha')
    print()
    user = User.objects.filter(username=username).first()
    if user is None:
        messages.error(request, 'Usuário ou senha inválidos')
        return render(request, 'login.html')
    if not user.check_password(senha):
        messages.error(request, 'senha inválida')
        return render(request, 'login.html')
    if not user.is_active:
        request.session['email_confirmacao'] = user.email
        return redirect('precisaConfirmar')
    user.backend = "django.contrib.auth.backends.ModelBackend"
    login(request, user)
    return redirect('homePerfil')

@login_required(login_url="/perfil/entrar/")
def loadPerfil(request):
        if not request.user.is_active:
            return render(request,'precisaConfirmar.html')
        if request.user.is_staff:
            barbeiros = Barbeiro.objects.all()
            listaBarbeiros = {
                "barbeiros":barbeiros
            }
            return render(request, 'perfilStaff.html',listaBarbeiros)
        agendamentos = Agendamentos.objects.filter(usuario=request.user)
        context = {
            "agendamentos": agendamentos
        }
        return render(request, 'perfil.html',context)
@login_required(login_url="/perfil/entrar/")
def buscar_agendamento(request):
    if request.method != "POST":
        return JsonResponse({"erro": "Método inválido"}, status=400)

    try:
        data = json.loads(request.body)
        dia = data.get("dia")
    except:
        return JsonResponse({"erro": "JSON inválido"}, status=400)

    try:
        dia_formatado = datetime.strptime(dia, "%Y-%m-%d").strftime("%d-%m-%Y")
    except:
        return JsonResponse({"erro": "Data inválida"}, status=400)

    agendamentos = Agendamentos.objects.filter(data__date=dia)

    lista = [
    {
        "barbeiro":a.barbeiro.user.username,
        "usuario": a.usuario.username if a.usuario else None,
        "data": a.data.strftime("%d-%m-%Y %H:%M"),
        "servico": a.servico,
        "status": a.status,
        "valor": float(a.valor) if a.valor is not None else None,
    }
    for a in agendamentos
]

    return JsonResponse({"agendamentos": lista})
def ForgotPassword(request):
    if request.method == 'GET':
        return render(request, 'email.html')
    email = request.POST.get('email')
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        messages.error(request, "Email não encontrado")
        return render(request, 'email.html')
    token = token_generator.make_token(user)
    link = request.build_absolute_uri(
    reverse('reset-password', kwargs={'user_id': user.pk, 'token': token})
)
    sendEmail(assunto="Redefinição de Senha",
        destinatario=email,
        texto="Clique no botão abaixo para redefinir sua senha:",
        texto_botao="Redefinir Senha",
        link_botao=link)
    messages.success(request, 'Email enviado')
    return render(request, 'email.html')
    

def sendEmail(assunto, destinatario, texto, texto_botao, link_botao):
    html = render_to_string("message.html", {
        "mensagem_texto": texto,
        "texto_botao": texto_botao,
        "link_botao": link_botao,
    })

    texto_simples = f"{texto}\nAcesse: {link_botao}"

    email = EmailMultiAlternatives(
        subject=assunto,
        body=texto_simples,
        from_email="gustavo.lfs2009@gmail.com",
        to=[destinatario],
    )

    email.attach_alternative(html, "text/html")
    email.send()

def ResetPassword(request, user_id, token):
    if request.method == 'GET':
        return render(request,  'forgotPass.html')
    try:
        user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        messages.error('Usuário inexistente, tente fazer o processo novamente')
        return render(request, 'forgotPass.html')
    if not token_generator.check_token(user,token):
        messages.error('token inválido envie o email novamente')
        return render(request, 'forgotPass.html')
    novaSenha = request.POST.get('novaSenha')
    repeatedNovaSenha = request.POST.get('repeatedNovaSenha')
    if (novaSenha == repeatedNovaSenha):
        user.set_password(novaSenha)
        user.save()
        print(user)
    login_url = reverse('login')
    messages.success(request,mark_safe(
        f'Senha alterada com sucesso <a href="{login_url}">Fazer login</a>'
    ))
    return render(request, 'forgotPass.html')

def confirmarEmail(request,user_id,token):
    print("DADOS RECEBIDOS:",user_id,token)
    try:
        user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        messages.error(request,'Usuário não encontrado, tente fazer o cadastro novamente')
        return render(request, 'cadastro.html')
    if not token_generator.check_token(user, token):
        messages.error(request,'Token inexistente mandeo email de novo')
        return render(request, 'precisaConfirmar.html')
    else:
        user.is_active = True
        user.save()
        return render(request, 'emailConfirmado.html')
    
def reenviarConfirmacao(request):
    email = request.session.get('email_confirmacao')
    user = User.objects.filter(email=email).first()
    if not email:
        messages.error(request, 'Sem email válido')
        return render(request,'precisaConfirmar.html')
    if not user:
        messages.error(request, 'Usuário não encontrado tente fazer o cadastro novamente')
        return render(request,'cadastro.html')
    token = token_generator.make_token(user)
    link = request.build_absolute_uri(
        f"/perfil/confirmar-email/{user.pk}/{token}/"
    )
    sendEmail(
        assunto="Confirme seu cadastro",
        destinatario=email,
        texto="Clique no botão abaixo para confirmar seu cadastro:",
        texto_botao="Confirmar e-mail",
        link_botao=link
    )
    messages.success(request, 'Email enviado com sucesso')
    return render(request,'precisaConfirmar.html')

def renderPrecisaConfirmar(request):
    email = request.session.get('email_confirmacao')
    if not email:
        return redirect('login')

    return render(request, 'precisaConfirmar.html', {'email': email})

def logoutFunction(request):
    logout(request)
    return redirect('home')

def cancelar_agendamento(request, id):
    if request.method == 'POST':
        try:
            ag = get_object_or_404(Agendamentos, id=id, usuario=request.user)
            ag.delete()
            messages.success(request, 'Agendamento cancelado com sucesso')
            return JsonResponse({
            'status': 'ok',
            'redirect_url': reverse('homePerfil') 
            })
        except:
            messages.error(request, 'Erro ao cancelar, reporte com o máximo de detalhes')
            return JsonResponse({
            'status': 'ok',
            'redirect_url': reverse('homePerfil') 
            })
    return JsonResponse({'status':'erro'}, status=400)

def criarFolga(request):
    if request.method == 'GET':
        return render(request, 'login.html')
    barbeiroId = request.POST.get('barbeiro')
    data = request.POST.get('dataFolga')
    motivo = request.POST.get('motivoFolga')
    print(data)
    barbeiro = Barbeiro.objects.get(id=barbeiroId)
    folga = Folga.objects.create(
        barbeiro=barbeiro,
        data=data,
        motivo=motivo,
    )
    if folga:
        messages.success(request, 'Folga criada com sucesso')
        return redirect('homePerfil')
    else:
        messages.error(request, 'erro ao criar folga')
        return redirect('homePerfil')
    
def seeFolgas(request):
    if request.method == 'POST':
        folgas = Folga.objects.filter(data__gte=date.today())
        lista = [
            {
                "id" : folga.id,
                "func" : folga.barbeiro.user.username,
                "data" : folga.data.strftime("%d/%m/%Y"),
                "motivo" : folga.motivo
            }
            for folga in folgas
        ]
    return JsonResponse({"folgas": lista})

def cancelar_folga(request,id):
    if request.method == 'POST':
        try:
            folga = get_object_or_404(Folga, id=id)
            folga.delete()
            messages.success(request, 'Folga cancelada')
            return JsonResponse({
            'status': 'ok',
            'redirect_url': reverse('homePerfil') 
            })
        except:
            messages.error(request, 'Erro ao excluir folga, reporte e tente mais tarde')
            return JsonResponse({
            'status': 'ok',
            'redirect_url': reverse('homePerfil') 
            })
    return JsonResponse({'status':'erro'}, status=400)


def salvarExpediente(request):
    if request.method == 'POST':
       
            barbeiroId = request.POST.get('barbeiroEx')
            barbeiro = Barbeiro.objects.get(id=barbeiroId)
            diaSemana = request.POST.get('diaSemana')
            naoTrabalha = request.POST.get('nao_trabalha')
            if naoTrabalha:
                Expediente.objects.filter(dia_semana=diaSemana).delete()
                messages.success(request, 'Dia marcado como sem expediente')
                return redirect('homePerfil')
            horaInicio = request.POST.get('horaInicio')
            horaFim = request.POST.get('horaFim')
            inicioAlmoco = request.POST.get('horaAlmocoInicio') or None
            fimAlmoco = request.POST.get('horaAlmocoFim') or None
            intervalo = request.POST.get('intervalo')
            if (horaInicio and horaFim and horaFim <= horaInicio) or (not horaInicio and not horaFim):
                messages.error(request, 'Horários de inicio e fim de expediente inválidos')
                return redirect('homePerfil')
            
            Expediente.objects.update_or_create(
                barbeiro=barbeiro,
                dia_semana=diaSemana,
                defaults={
                    'hora_inicio': horaInicio,
                    'hora_fim': horaFim,
                    'intervalo': intervalo,
                    'almoco_inicio': inicioAlmoco,
                    'almoco_fim': fimAlmoco,
                }
            )
            messages.success(request, 'Expediente salvo com sucesso')
            return redirect('homePerfil')
        # except Exception:
        #     messages.error(request, 'Erro ao salvar expediente')
        #     return redirect('homePerfil')
    return HttpResponse('Erro ao salvar')

def gerar_horarios(
hora_inicio,
hora_fim,
intervalo,
almoco_inicio=None,
almoco_fim=None
):
    def hora_para_minutos(h):
        if isinstance(h, str):
            h, m = map(int, h.split(':'))
        elif isinstance(h, time):
            h, m = h.hour, h.minute
        else:
            raise ValueError('Formato de hora inválido')
        return h * 60 + m

    def minutos_para_hora(min):
        h = min // 60
        m = min % 60
        return f'{h:02d}:{m:02d}'
    inicio = hora_para_minutos(hora_inicio)
    fim = hora_para_minutos(hora_fim)
    almoco_i = hora_para_minutos(almoco_inicio) if almoco_inicio else None
    almoco_f = hora_para_minutos(almoco_fim) if almoco_fim else None
    horarios = []
    atual = inicio
    while atual + intervalo <= fim:
        if almoco_i and almoco_i <= atual < almoco_f:
            atual += intervalo
            continue
        horarios.append(minutos_para_hora(atual))
        atual += intervalo
    return horarios
def verExpediente(request):
    if request.method != 'POST':
        return JsonResponse({'erro': 'erro de requisição'},status=400)
    expediente = Expediente.objects.all()
    listaExpediente = [{
        'dia_semana' : ex.get_dia_semana_display(),
        'hora_inicio' : ex.hora_inicio,
        'hora_fim' : ex.hora_fim,
        'almoco_inicio' : ex.almoco_inicio,
        'almoco_fim' : ex.almoco_fim,
        'intervalo' : ex.intervalo,
        'barbeiro' : ex.barbeiro.user.username,
    }
        for ex in expediente
    ]
    return JsonResponse({'conteudo' : listaExpediente})

def verFunc(request):
    if request.method != 'POST':
        return JsonResponse({'erro':'erro de requisição'},status=400)
    funcionario = Barbeiro.objects.all()
    lista_func = [{
        'img':func.foto.url,
        'nome':func.user.username,
        'email':func.user.email,
        'id':func.id
    } for func in funcionario
    ]
    return JsonResponse({
        'conteudo':lista_func
    })
    
def demitir(request,id):
    if request.method != 'POST':
        return JsonResponse({'erro': 'erro de requisição'},status=400)
    barbeiro = get_object_or_404(Barbeiro,id=id)
    expediente = Expediente.objects.filter(barbeiro=barbeiro)
    expediente.delete()
    user = barbeiro.user
    barbeiro.delete()
    user.delete()
    messages.success(request, 'Funcionário demitido')
    return JsonResponse({
    'status': 'ok',
    'redirect_url': reverse('homePerfil') 
    })
    