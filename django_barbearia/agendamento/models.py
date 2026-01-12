from django.db import models
from django.contrib.auth.models import User
from login.models import Barbeiro

# Create your models here.

class Agendamentos(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    data = models.DateTimeField()
    servico = models.CharField(max_length=100)
    status = models.CharField(max_length=10, blank=True, null=True)
    valor = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    barbeiro = models.ForeignKey(Barbeiro, on_delete=models.CASCADE)
    class Meta:
        managed = True
        db_table = 'agendamentos'
        constraints = [
            models.UniqueConstraint(
                fields=['barbeiro', 'data'],
                name='unique_horario_barbeiro'
            )
        ]