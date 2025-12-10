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
from datetime import datetime
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
        messages.success(request,'Usuário cadastrado com sucesso, verifique seu email para ativar a conta')
        return render(request, 'cadastro.html')
    

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
            return render(request, 'perfilStaff.html')
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
    messages.success(request,'Senha alterada com sucesso <a href="{login_url}">Fazer login</a>')
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

def confirmar_agendamento(request, id):
    ag = get_object_or_404(Agendamentos, id=id, usuario=request.user)
    ag.status = "confirmado"
    ag.save()
    return redirect("/perfil/")


def cancelar_agendamento(request, id):
    ag = get_object_or_404(Agendamentos, id=id, usuario=request.user)
    ag.status = "cancelado"
    ag.save()
    return redirect("/perfil/")