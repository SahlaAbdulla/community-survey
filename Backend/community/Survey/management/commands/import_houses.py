import pandas as pd
import math
from django.core.management.base import BaseCommand
from Survey.models import Family, Cluster, House


# --- Helper function to clean numbers safely ---
def clean_number(value):
    if value is None:
        return None
    if isinstance(value, float) and math.isnan(value):
        return None
    if value == "":
        return None
    try:
        return int(value)
    except:
        return None


# --- Helper function to convert Yes/No to Boolean ---
def yesno(value):
    return str(value).strip().lower() == "yes"


# --- Helper: Split House Number ("12 A" → 12, A) ---
def split_house_number(value):
    if not value or str(value).strip().lower() == "nan":
        return "", ""

    parts = str(value).strip().split()

    if len(parts) == 1:
        return parts[0], ""
    else:
        return parts[0], parts[1].upper()


class Command(BaseCommand):
    help = "Import Houses from Excel file (SAFE)"

    def add_arguments(self, parser):
        parser.add_argument("excel_path", type=str, help="Path to the Excel file")

    def handle(self, *args, **kwargs):
        excel_path = kwargs["excel_path"]

        try:
            df = pd.read_excel(excel_path)

            print("\n================ EXCEL COLUMNS ================")
            print(df.columns.tolist())
            print("================================================\n")

            self.stdout.write(self.style.SUCCESS(f"📄 Loaded {len(df)} rows from Excel"))

            for index, row in df.iterrows():

                # -------------------------------------------------
                # 1️⃣ FAMILY
                # -------------------------------------------------
                family_name = row.get("Family Name")

                if not family_name or str(family_name).strip().lower() == "nan":
                    self.stdout.write(self.style.ERROR(
                        f"❌ Family Name missing in row {index + 1}"
                    ))
                    continue

                family = Family.objects.filter(
                    family_name_en=str(family_name).strip()
                ).first()

                if not family:
                    self.stdout.write(self.style.ERROR(
                        f"❌ Family not found: {family_name}"
                    ))
                    continue

                # -------------------------------------------------
                # 2️⃣ CLUSTER (SAFE FIX)
                # -------------------------------------------------
                cluster_raw = row.get("Cluster")

                if not cluster_raw or str(cluster_raw).strip().lower() == "nan":
                    self.stdout.write(self.style.ERROR(
                        f"❌ Cluster missing in row {index + 1}"
                    ))
                    continue

                cluster_ml = str(cluster_raw).strip()

                # 🔍 Try to find existing cluster by Malayalam OR English
                cluster = Cluster.objects.filter(
                    name_malayalam=cluster_ml
                ).first() or Cluster.objects.filter(
                    name_english=cluster_ml
                ).first()

                if not cluster:
                    # ✅ Create new cluster safely
                    cluster = Cluster.objects.create(
                        name_english=cluster_ml,     # fallback
                        name_malayalam=cluster_ml
                    )
                    self.stdout.write(
                        self.style.SUCCESS(f"🆕 Created Cluster: {cluster_ml}")
                    )
                else:
                    # ✅ Update Malayalam if missing (NO overwrite)
                    if not cluster.name_malayalam:
                        cluster.name_malayalam = cluster_ml
                        cluster.save()

                # -------------------------------------------------
                # 3️⃣ OWNER
                # -------------------------------------------------
                owner_en = row.get("Owner")

                if not owner_en or str(owner_en).strip().lower() == "nan":
                    self.stdout.write(self.style.ERROR(
                        f"❌ Owner missing → row {index + 1}"
                    ))
                    continue

                owner_ml = owner_en
                if isinstance(owner_ml, float) and math.isnan(owner_ml):
                    owner_ml = ""

                # -------------------------------------------------
                # 4️⃣ HOUSE NUMBER → Family
                # -------------------------------------------------
                h_no_raw = row.get("House Number")
                h_no, sub = split_house_number(h_no_raw)

                if h_no and (family.h_no != h_no or family.sub != sub):
                    family.h_no = h_no
                    family.sub = sub
                    family.save()

                # -------------------------------------------------
                # 5️⃣ CREATE HOUSE (NO DATA LOSS)
                # -------------------------------------------------
                house = House.objects.create(
                    owner_en=owner_en,
                    owner_ml=owner_ml,

                    family=family,
                    cluster=cluster,

                    h_address=row.get("Address") or "",
                    phone_no=row.get("Phone Number") or "",
                    roll_no=row.get("Roll No") or "",

                    livestock_count=clean_number(row.get("Livestock Count")),

                    # Utilities
                    has_water_source=yesno(row.get("Water Source")),
                    w_source=row.get("Water Source") or "",

                    g_connection=yesno(row.get("Gas Connection")),
                    biogas=yesno(row.get("Biogas")),
                    solar=yesno(row.get("Solar")),
                    h_electricity=yesno(row.get("Electricity")),
                    h_refrigerator=yesno(row.get("Refrigerator")),
                    h_washing_machine=yesno(row.get("Washing Machine")),

                    # House
                    h_type=row.get("House Type") or "",
                    road_access_type=row.get("Road Access") or "",

                    # Waste
                    waste_disposal_method=row.get("Waste Disposal") or "",

                    # Agriculture
                    h_agriculture=yesno(row.get("Agriculture")),
                    agriculture_type=row.get("Agriculture Type") or "",

                    # Livestock
                    h_livestock=yesno(row.get("Livestock")),
                    livestock_type=row.get("Livestock Type") or "",

                    # Ration
                    ration_card=yesno(row.get("Ration Card")),
                    ration_card_number=row.get("Ration Card Number") or "",
                    ration_card_category=row.get("Ration Card Category") or "",

                    remark=row.get("Remark") or ""
                )

                house.update_counts()

                self.stdout.write(self.style.SUCCESS(
                    f"✅ Imported house: {house.owner_en} ({h_no} {sub})"
                ))

            self.stdout.write(self.style.SUCCESS("\n🎉 IMPORT COMPLETED SUCCESSFULLY"))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ Error: {e}"))
