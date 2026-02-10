import pandas as pd
from django.core.management.base import BaseCommand
from Survey.models import Family

class Command(BaseCommand):
    help = "Auto-create Family records from Excel before importing houses"

    def add_arguments(self, parser):
        parser.add_argument('excel_path', type=str, help="Path to Excel")

    def handle(self, *args, **kwargs):
        excel_path = kwargs['excel_path']

        df = pd.read_excel(excel_path)

        family_names = df["Family Name"].dropna().unique()

        created = 0

        for name in family_names:
            obj, is_created = Family.objects.get_or_create(
                family_name_en=name
            )
            if is_created:
                created += 1
                self.stdout.write(self.style.SUCCESS(f"➕ Created Family: {name}"))

        self.stdout.write(self.style.SUCCESS(f"\n🎉 Total new families created: {created}"))
