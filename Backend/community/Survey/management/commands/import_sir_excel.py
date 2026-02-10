import pandas as pd
import math
import re
from django.core.management.base import BaseCommand
from Survey.models import Member, MemberNameVariant

# ---------------------------------------
# HELPERS
# ---------------------------------------
def clean_str(v):
    if v is None:
        return ""
    if isinstance(v, float) and math.isnan(v):
        return ""
    return str(v).strip()

def normalize_name(name):
    name = clean_str(name).lower()
    name = re.sub(r"[^\w\s]", "", name)
    name = re.sub(r"\s+", " ", name)
    return name.strip()

def save_alias(member, name_en, name_ml="", source="sir"):
    if not name_en:
        return

    MemberNameVariant.objects.get_or_create(
        member=member,
        normalized_name=normalize_name(name_en),
        defaults={
            "name_en": name_en,
            "name_ml": name_ml,
            "source": source,
            "is_primary": False
        }
    )

# ---------------------------------------
# COMMAND
# ---------------------------------------
class Command(BaseCommand):
    help = "SIR UPDATE IMPORT (SAFE – Booth + ID based)"

    def add_arguments(self, parser):
        parser.add_argument("excel_path", type=str)

    def handle(self, *args, **kwargs):

        df = pd.read_excel(kwargs["excel_path"], dtype=str)

        updated = 0
        skipped = 0

        for _, row in df.iterrows():

            booth = clean_str(row.get("Polling Booth No"))
            roll_sec = clean_str(row.get("Roll No-SEC"))
            roll_ceo = clean_str(row.get("Roll No-ECI"))
            epic_id = clean_str(row.get("Epic ID"))
            voter_id = clean_str(row.get("Voter ID"))

            if not booth:
                skipped += 1
                continue

            qs = Member.objects.filter(polling_booth_no=booth)

            member = None
            if roll_sec:
                member = qs.filter(roll_no_sec=roll_sec).first()
            elif roll_ceo:
                member = qs.filter(roll_no_ceo=roll_ceo).first()
            elif epic_id:
                member = qs.filter(epic_id=epic_id).first()
            elif voter_id:
                member = qs.filter(voter_id_number=voter_id).first()

            if not member:
                skipped += 1
                continue

            # -----------------------------
            # NAME → ALIAS + UPDATE
            # -----------------------------
            new_name_en = clean_str(row.get("Name(EN)"))
            new_name_ml = clean_str(row.get("Name(ML)"))

            if new_name_en and new_name_en != member.m_name_en:
                save_alias(
                    member,
                    name_en=member.m_name_en,
                    name_ml=member.m_name_ml,
                    source="sir"
                )
                member.m_name_en = new_name_en
                member.m_name_ml = new_name_ml or member.m_name_ml

            # -----------------------------
            # GUARDIAN → ALIAS + UPDATE
            # -----------------------------
            new_guardian = clean_str(row.get("Guardian's Name(EN)"))
            if new_guardian and new_guardian != member.guardian_en:
                save_alias(
                    member,
                    name_en=member.guardian_en,
                    source="sir"
                )
                member.guardian_en = new_guardian

            # -----------------------------
            # 🔥 EPIC / ECI / VOTER UPDATE
            # (only if empty – SAFE)
            # -----------------------------
            if epic_id and not member.epic_id:
                member.epic_id = epic_id

            if roll_ceo and not member.roll_no_ceo:
                member.roll_no_ceo = roll_ceo

            if voter_id and not member.voter_id_number:
                member.voter_id_number = voter_id

            # election flag
            if epic_id or roll_sec or roll_ceo or voter_id:
                member.election_id = True

            member.save()
            updated += 1

            self.stdout.write(
                self.style.SUCCESS(f"🔄 Updated (SIR): {member.m_name_en}")
            )

        self.stdout.write(
            self.style.SUCCESS(
                f"\n✅ SIR UPDATE COMPLETED | Updated: {updated} | Skipped: {skipped}"
            )
        )
