import pandas as pd
import math
from django.core.management.base import BaseCommand
from Survey.models import Member


# -----------------------------
# CLEANERS
# -----------------------------
def clean_str(v):
    if v is None:
        return ""
    if isinstance(v, float) and math.isnan(v):
        return ""
    return str(v).strip()


# -----------------------------
# POLLING BOOTH READER
# -----------------------------
def get_polling_booth(row):
    for col in [
        "Polling Booth No",
        "Polling Booth",
        "Booth No",
        "Booth",
    ]:
        if col in row:
            val = row.get(col)

            if val is None:
                continue
            if isinstance(val, float) and math.isnan(val):
                continue

            if isinstance(val, (int, float)):
                return str(int(val))

            val = str(val).strip()
            if val:
                return val
    return ""


# =============================
# DJANGO COMMAND (MANDATORY)
# =============================
class Command(BaseCommand):
    help = "Fix polling_booth_no from Excel"

    def add_arguments(self, parser):
        parser.add_argument("excel_path", type=str)

    def handle(self, *args, **kwargs):
        df = pd.read_excel(kwargs["excel_path"])
        df.columns = df.columns.str.strip()

        updated = 0

        for _, row in df.iterrows():
            voter_id = clean_str(row.get("Voter ID"))
            roll_no = clean_str(row.get("Roll No"))

            if not voter_id and not roll_no:
                continue

            booth = get_polling_booth(row)
            if not booth:
                continue

            qs = Member.objects.all()
            if voter_id:
                qs = qs.filter(voter_id_number=voter_id)
            elif roll_no:
                qs = qs.filter(roll_no=roll_no)

            for m in qs:
                m.polling_booth_no = booth
                m.save(update_fields=["polling_booth_no"])
                updated += 1
                self.stdout.write(
                    self.style.SUCCESS(
                        f"✅ Updated: {m.m_name_en} | Booth: {booth}"
                    )
                )

        self.stdout.write(
            self.style.SUCCESS(
                f"\n🎉 DONE — Polling Booth Updated for {updated} members"
            )
        )
