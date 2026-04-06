from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('students', '0003_studymaterial_cloudinary_public_id_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='studymaterial',
            name='youtube_url',
            field=models.URLField(blank=True, max_length=500, null=True),
        ),
    ]
