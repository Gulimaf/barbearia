from django.contrib import admin
from django.urls import path
from . import views

urlpatterns = [
    path('', views.loadPerfil,name="homePerfil"),
    path('entrar/',views.entrar,name="login"),
    path('cadastrar/',views.cadastro,name="cadastro"),
    path('senha/',views.ForgotPassword,name="novaSenha"),
    path('reset-password/<int:user_id>/<str:token>/', views.ResetPassword, name='reset-password'),
    path('confirmar-email/<int:user_id>/<str:token>/', views.confirmarEmail, name='confirmar-email'),
    path("reenviar-confirmacao/", views.reenviarConfirmacao, name="reenviar-confirmacao"),
    path("aviso-confirmacao/", views.renderPrecisaConfirmar, name="precisaConfirmar"),
    path('perfil/buscar-agendamento/', views.buscar_agendamento, name='buscar-agendamento'),
    path('logout/', views.logoutFunction, name='logout'),
    path('agendamento/cancelar/<int:id>/', views.cancelar_agendamento, name="cancelar-agendamento"),
    path('folga/',views.criarFolga, name="folga"),
    path('ver-folgas/', views.seeFolgas, name="verFolgas"),
    path('folga/cancelar/<int:id>/', views.cancelar_folga, name="cancelar-folga"),
    path('salvar-expediente/',views.salvarExpediente,name="expediente"),
    path('ver-expediente/',views.verExpediente, name="verExpediente"),
    path('cadastrar-barbeiro/',views.cadastroBarbeiro, name="cadastrarBarbeiro"),
    path('ver-func/',views.verFunc, name="verFunc"),
    path('demitir/<int:id>/',views.demitir,name="demitir"),
]
