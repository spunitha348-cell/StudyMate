from django.db import migrations, models


def forwards(apps, schema_editor):
    User = apps.get_model('accounts', 'User')
    User.objects.filter(role='admin').update(role='faculty')


def backwards(apps, schema_editor):
    User = apps.get_model('accounts', 'User')
    User.objects.filter(role='faculty').update(role='admin')


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='role',
            field=models.CharField(
                choices=[('faculty', 'Faculty'), ('student', 'Student')],
                default='student',
                max_length=10,
            ),
        ),
        migrations.RunPython(forwards, backwards),
    ]
