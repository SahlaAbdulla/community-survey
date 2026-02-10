import pandas as pd
import math
import re
from datetime import datetime
from django.core.management.base import BaseCommand
from Survey.models import (
    Member, WardDetails, MemberEducation, Family, Cluster,
    MemberNameVariant
)

# ---------------------------------------
# CLEANERS
# ---------------------------------------
def clean_str(v):
    if v is None:
        return ""
    if isinstance(v, float) and math.isnan(v):
        return ""
    return str(v).strip()

def clean_int(v):
    try:
        v = str(v).strip()
        return int(float(v)) if v else None
    except:
        return None

def yesno(v):
    return str(v).strip().lower() == "yes"

def parse_date(v):
    if not v:
        return None
    if isinstance(v, datetime):
        return v.date()
    for fmt in ("%Y-%m-%d", "%d-%m-%Y", "%d/%m/%Y"):
        try:
            return datetime.strptime(str(v), fmt).date()
        except:
            pass
    return None

def clean_roll(v):
    if pd.isna(v):
        return ""
    return str(int(v)) if isinstance(v, float) else str(v).strip()


# ---------------------------------------
# MALAYALAM DETECTOR
# ---------------------------------------
def is_malayalam(text):
    return any("\u0D00" <= ch <= "\u0D7F" for ch in text)

# ---------------------------------------
# NAME NORMALIZER
# ---------------------------------------
def normalize_name(name):
    name = clean_str(name).lower()
    name = re.sub(r"[^\w\s]", "", name)
    name = re.sub(r"\b[a-z]{1,2}\b", "", name)
    name = re.sub(r"\s+", " ", name)
    return name.strip()

# ---------------------------------------
# SAFE COLUMN FETCHER
# ---------------------------------------
def get_col(row, *names):
    for n in names:
        if n in row:
            val = clean_str(row.get(n))
            if val:
                return val
    return ""

class Command(BaseCommand):
    help = "Import Members with spelling-safe alias support"

    def add_arguments(self, parser):
        parser.add_argument("excel_path", type=str)

    def handle(self, *args, **kwargs):

        df = pd.read_excel(kwargs["excel_path"], dtype=str)


        for _, row in df.iterrows():

            # -------------------------------
            # 1️⃣ CLUSTER
            # -------------------------------
            cluster_raw = get_col(
                row, "Cluster", "Cluster Name", "Cluster Name (EN)", "Cluster Name (ML)"
            )
            cluster_ml_excel = get_col(row, "Cluster Name (ML)")
            cluster_obj = None

            if cluster_raw:
                if is_malayalam(cluster_raw):
                    cluster_obj = Cluster.objects.filter(
                        name_malayalam=cluster_raw
                    ).first()
                    if not cluster_obj:
                        cluster_obj = Cluster.objects.create(
                            name_malayalam=cluster_raw,
                            name_english=cluster_raw
                        )
                else:
                    cluster_obj = Cluster.objects.filter(
                        name_english__iexact=cluster_raw
                    ).first()
                    if not cluster_obj:
                        cluster_obj = Cluster.objects.create(
                            name_english=cluster_raw
                        )

                if cluster_ml_excel and not cluster_obj.name_malayalam:
                    cluster_obj.name_malayalam = cluster_ml_excel
                    cluster_obj.save()

            # -------------------------------
            # 2️⃣ FAMILY
            # -------------------------------
            house_raw = get_col(row, "House No", "House Number")
            h_no, sub = "", ""
            if house_raw:
                parts = house_raw.split("/")
                h_no = parts[0].strip()
                sub = parts[1].strip() if len(parts) > 1 else ""

            family_name_en = get_col(row, "Family Name(EN)", "Family Name (EN)", "Family Name")
            family_name_ml = get_col(row, "Family Name(ML)", "Family Name (ML)")

            family_obj, _ = Family.objects.get_or_create(
                h_no=h_no,
                sub=sub,
                defaults={
                    "family_name_en": family_name_en,
                    "family_name_ml": family_name_ml,
                    "cluster": cluster_obj
                }
            )

            # -------------------------------
            # 3️⃣ CONSTITUENCY
            # -------------------------------
            constituency_obj = None
            raw_const = get_col(row, "Constituency", "Ward")
            if raw_const:
                num = raw_const.lower().replace("ward", "").strip()
                constituency_obj = WardDetails.objects.filter(
                    constituency__iexact=num
                ).first()

            # -------------------------------
            # 4️⃣ OWNER
            # -------------------------------
            owner_name = ""
            if get_col(row, "House Owner").lower() == "yes":
                owner_name = get_col(row, "Name(EN)", "Name")

            # -------------------------------
            # 5️⃣ DUPLICATE + ALIAS CHECK
            # -------------------------------
            name_en_raw = get_col(row, "Name(EN)", "Name (EN)", "Name")
            norm_new = normalize_name(name_en_raw)
            age_val = clean_int(row.get("Age"))

            voter_id = get_col(row, "Voter ID")
            roll_no_sec = get_col(row, "Roll No")
            guardian_en = normalize_name(get_col(row, "Guardian's Name(EN)"))
            guardian_ml = normalize_name(get_col(row, "Guardian's Name(ML)"))

            existing_member = None

            candidates = Member.objects.filter(
                family=family_obj,
                m_age=age_val
            )

            for mem in candidates:

                if voter_id and mem.voter_id_number == voter_id:
                    existing_member = mem
                    break

                if roll_no_sec and mem.roll_no_sec == roll_no_sec:
                    existing_member = mem
                    break

                if roll_no_ceo and mem.roll_no_ceo == roll_no_ceo:
                    existing_member = mem
                    break

                if epic_id and mem.epic_id == epic_id:
                    existing_member = mem
                    break

                # if (
                #     normalize_name(mem.m_name_en) == norm_new
                #     and (
                #         normalize_name(mem.guardian_en) == guardian_en
                #         or normalize_name(mem.guardian_ml) == guardian_ml
                #     )
                # ):
                #     existing_member = mem
                #     break

            # -------------------------------
            # 6️⃣ IF DUPLICATE → SAVE ALIAS
            # -------------------------------
            if existing_member:
                MemberNameVariant.objects.get_or_create(
                    member=existing_member,
                    normalized_name=norm_new,
                    defaults={
                        "name_en": name_en_raw,
                        "name_ml": get_col(row, "Name(ML)", "Name (ML)"),
                        "source": "excel"
                    }
                )

                self.stdout.write(
                    self.style.WARNING(
                        f"🔁 Alias saved: {existing_member.m_name_en} ({name_en_raw})"
                    )
                )
                continue

            # -------------------------------------------------
            # 6️⃣ CREATE MEMBER
            # -------------------------------------------------
            voter_id = get_col(row, "Voter ID")
            roll_no_sec = get_col(row, "Roll No", "Roll No-SEC")
            roll_no_ceo = get_col(row, "Roll No-ECI")
            epic_id = get_col(row, "Epic ID")

            m = Member.objects.create(
                family=family_obj,
                m_name_en=name_en_raw,
                m_name_ml=get_col(row, "Name(ML)", "Name (ML)"),
                owner_name=owner_name,
                family_name_common=get_col(
                    row,
                    "Family Name(COMMONLY KNOWN)",
                    "Family Name Common"
                ),
                m_gender=get_col(row, "Gender"),
                date_of_birth=parse_date(row.get("Date of Birth")),
                m_age=age_val,
                marital_status=get_col(row, "Marital Status"),
                phone_no=get_col(row, "Phone Number", "Phone"),
                blood_grp=get_col(row, "Blood Group"),
                religion=get_col(row, "Religion"),
                caste=get_col(row, "Caste"),
                job_status=yesno(row.get("Job Status")),
                job_country=get_col(row, "Job Country"),
                monthly_income=clean_int(row.get("Monthly Income")),
                organization=get_col(row, "Organization"),
                guardian_en=get_col(row, "Guardian's Name(EN)"),
                guardian_ml=get_col(row, "Guardian's Name(ML)"),
                org_type=get_col(row, "Organization Type"),
                voter_id_number=voter_id or None,
                roll_no_sec=roll_no_sec or None,
                roll_no_ceo=roll_no_ceo or None,
                epic_id=epic_id or None,
                election_id=bool(voter_id or roll_no_sec or roll_no_ceo or epic_id),
                constituency=constituency_obj,
                polling_booth_no=get_col(row, "Polling Booth No"),
                political_party=get_col(row, "Political Party"),
                political_type=get_col(row, "Political Type"),
                m_pension=yesno(row.get("Pension")),
                pension_type=get_col(row, "Pension Type"),
                m_disability=yesno(row.get("Disability")),
                m_health_insurance=yesno(row.get("Health Insurance")),
                chronic_disease=get_col(row, "Chronic Disease"),
            )

            MemberNameVariant.objects.create(
                member=m,
                name_en=name_en_raw,
                name_ml=get_col(row, "Name(ML)", "Name (ML)"),
                normalized_name=norm_new,
                is_primary=True,
                source="excel"
            )

            # -------------------------------------------------
            # 7️⃣ EDUCATION
            # -------------------------------------------------
            for edu in get_col(row, "Education").split(","):
                edu = edu.strip()
                if edu:
                    MemberEducation.objects.create(
                        member=m,
                        education=edu
                    )

            self.stdout.write(
                self.style.SUCCESS(f"✅ Imported: {m.m_name_en}")
            )

        self.stdout.write(
            self.style.SUCCESS("\n🎉 IMPORT COMPLETED (Alias-safe & Duplicate-proof)")
        )
