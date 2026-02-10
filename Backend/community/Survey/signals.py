from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Member, House

@receiver([post_save, post_delete], sender=Member)
def update_house_member_count(sender, instance, **kwargs):
    # 🛑 family already deleted or null
    if not instance.family_id:
        return

    try:
        family = instance.family
    except Exception:
        return

    # Family might have multiple houses
    for house in family.houses.all():
        house.update_counts()
