from django.db import models
from django.contrib.auth.models import User
class Barbeiro(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    ativo = models.BooleanField(default=True)
    foto = models.ImageField(upload_to='barbeiros/', null=True, blank=True)

    class Meta:
        managed = True
        db_table = 'barbeiro'
class Usuarios(models.Model):
    nome = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    telefone = models.CharField(max_length=20)
    senha = models.CharField(max_length=255)

    class Meta:
        managed = False
        db_table = 'usuarios'


class Folga(models.Model):
    data = models.DateField(unique=True)
    motivo = models.CharField(max_length=100, blank=True)
    barbeiro = models.ForeignKey(Barbeiro, on_delete=models.CASCADE)
    class Meta:
        managed = True
        db_table = 'folgas'

class Expediente(models.Model):
    DIA_SEMANA = [
        (0, 'Segunda'),
        (1, 'Terça'),
        (2, 'Quarta'),
        (3, 'Quinta'),
        (4, 'Sexta'),
        (5, 'Sábado'),
        (6, 'Domingo'),
    ]

    dia_semana = models.IntegerField(choices=DIA_SEMANA)
    hora_inicio = models.TimeField()
    hora_fim = models.TimeField()
    intervalo = models.PositiveIntegerField(
        help_text='Intervalo entre horários (em minutos)'
    )
    almoco_inicio = models.TimeField(null=True, blank=True)
    almoco_fim = models.TimeField(null=True, blank=True)
    barbeiro = models.ForeignKey(Barbeiro, on_delete=models.CASCADE)
    class Meta:
        managed = True
        db_table = 'expediente'
        unique_together = ('barbeiro','dia_semana')


