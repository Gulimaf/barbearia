from django.contrib import admin
from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='home'),
    path('horarios/',views.verificarHorarios, name='horarios'),
    path('agendamento-primeiro-passo/',views.renderAgendamentoFirst,name='agendamento'),
    path('agendamento-segundo-passo/',views.renderAgendamentoSecond ,name='segundoAgendamento'),
    path('agendamento-terceiro-passo/',views.renderAgendamentoThird ,name='terceiroAgendamento'),
    path('agendar/', views.agendar, name='agendar'),
    path('ver-func-ag/',views.verFunc, name="verFuncAg"),
    path('enviar-func/',views.receberFunc,name="receberFunc"),
]
