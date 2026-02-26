# users/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    phone_no = models.CharField(max_length=15, blank=True, null=True)
    user_type = models.CharField(
        max_length=20,
        choices=(("Super Admin","Super Admin"),("Dept Admin","Dept Admin"),("User","User"))
    )
    department = models.CharField(max_length=50, blank=True, null=True)

class Cluster(models.Model):
    name_english = models.CharField(
        max_length=255,
        unique=True,
        null=True,
        blank=True
    )
    name_malayalam = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name_malayalam or self.name_english or "Cluster"
  


class Family(models.Model):
    # ✅ English + Malayalam
    family_name_en = models.CharField(max_length=100, blank=True, null=True)
    family_name_ml = models.CharField(max_length=100, blank=True, null=True)

    h_no = models.CharField(max_length=10, blank=True, null=True)
    sub = models.CharField(max_length=10, blank=True, null=True)

    cluster = models.ForeignKey(
        Cluster,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="families"
    )

    class Meta:
        unique_together = ('h_no', 'sub')  

    def __str__(self):
        return f"{self.family_name_en} / {self.family_name_ml} ({self.h_no}{self.sub})"







class House(models.Model):
    # ✅ Owner Details
    owner_en = models.CharField(max_length=120)
    owner_ml = models.CharField(max_length=120, blank=True, null=True)

    # ✅ Family relation
    family = models.ForeignKey(Family, on_delete=models.CASCADE, related_name="houses")
    cluster = models.ForeignKey(Cluster, on_delete=models.SET_NULL, null=True, blank=True)

    # ✅ Basic Info
    h_address = models.TextField(max_length=15, blank=True, null=True)
    phone_no = models.CharField(max_length=15, blank=True, null=True)

    # ✅ Election fields 👇👇👇 (ADD THIS PART)
    roll_no = models.CharField(max_length=20, blank=True, null=True)
    total_members = models.PositiveIntegerField(default=0)
    total_voters = models.PositiveIntegerField(default=0)

    # ✅ Area and type
    has_water_source = models.CharField(max_length=50,blank=True, null=True)
    w_source = models.CharField(max_length=50,blank=True, null=True)
    water_no_other = models.CharField(max_length=50,blank=True, null=True)
    water_yes_other = models.CharField(max_length=50,blank=True, null=True)
    area = models.CharField(max_length=50, blank=True, null=True)

    h_type = models.CharField(max_length=50,blank=True, null=True)
    h_type_other = models.CharField(max_length=50,blank=True, null=True)
    h_status = models.CharField(max_length=500,blank=True, null=True)
    h_status_other = models.CharField(max_length=50,blank=True, null=True)
    land = models.CharField(max_length=50,blank=True, null=True)
    financial_status = models.CharField(max_length=50,blank=True, null=True)
    road_access_type = models.CharField(max_length=50)
    road_access_type_other = models.CharField(max_length=50,blank=True, null=True)
    

    # ✅ Utilities
    g_connection = models.BooleanField(default=False)
    biogas = models.BooleanField(default=False)
    solar = models.BooleanField(default=False)
    h_electricity = models.BooleanField(default=False)
    h_refrigerator = models.BooleanField(default=False)
    h_washing_machine = models.BooleanField(default=False)

    # ✅ Toilet and Livestock
    h_toilet = models.BooleanField(default=False)
    h_livestock = models.BooleanField(default=False)

    livestock_type = models.CharField(max_length=50,blank=True, null=True)
    livestock_type_other = models.CharField(max_length=50,blank=True, null=True)
    livestock_count = models.PositiveIntegerField(blank=True, null=True)

    # ✅ Waste Disposal (dropdown instead of boolean)
    
    waste_disposal_method = models.CharField(max_length=50,blank=True, null=True)
    waste_disposal_method_other = models.CharField(max_length=50,blank=True, null=True)

    # ✅ Agriculture (if yes, show type dropdown)
    h_agriculture = models.BooleanField(default=False)
    
    agriculture_type = models.CharField(max_length=50,blank=True, null=True)
    agriculture_type_other = models.CharField(max_length=50,blank=True, null=True)

    # ✅ Ration Card Fields
    ration_card = models.BooleanField(default=False)
    ration_card_number = models.CharField(max_length=50, blank=True, null=True)
    RATION_CATEGORY_CHOICES = [
        ("APL", "APL"),
        ("BPL", "BPL"),
        ("AAY", "AAY"),
        ("Antyodaya", "Antyodaya"),
    ]
    ration_card_category = models.CharField(max_length=50, choices=RATION_CATEGORY_CHOICES, blank=True, null=True)

    remark = models.CharField(max_length=100, null=True, blank=True)  # ← ADD THIS

    # ✅ Timestamp
    created_at = models.DateTimeField(auto_now_add=True)

    def update_counts(self):
        members = self.family.members.all()  # related_name="members" from Member model

        self.total_members = members.count()
        self.total_voters = members.filter(election_id=True).count()

        self.save(update_fields=["total_members", "total_voters"])

    def __str__(self):
        return f"{self.family.family_name_en} - {self.owner_en}"
    
class MadrasaDetails(models.Model):
    member = models.OneToOneField(
        'Member', on_delete=models.CASCADE, related_name='madrasa_details'
    )
    studied = models.BooleanField(default=False)
    madrasa_name = models.CharField(max_length=200, blank=True, null=True)
    years_studied = models.CharField(max_length=100, blank=True, null=True)
    language = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"{self.member.m_name_en} - {'Studied' if self.studied else 'Not Studied'}"
    
class MemberEducation(models.Model):
    member = models.ForeignKey(
        'Member', on_delete=models.CASCADE, related_name='educations'
    )
    education = models.CharField(max_length=100)
    education_status = models.CharField(max_length=20, blank=True, null=True)
    education_stream = models.CharField(max_length=100, blank=True, null=True)
    

    def __str__(self):
        return f"{self.member.m_name_en} - {self.education}"
    

    





class Member(models.Model):
    family = models.ForeignKey(Family, on_delete=models.CASCADE, related_name="members",blank=True, null=True)
    house = models.ForeignKey(
        House,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="house_members"
    )

    # ✅ Name in English + Malayalam
    m_name_en = models.CharField(max_length=200,blank=True, null=True)
    m_name_ml = models.CharField(max_length=200, blank=True, null=True)
    owner_name = models.CharField(max_length=120, blank=True, null=True)
    family_name_common = models.CharField(max_length=200, blank=True, null=True)
    
    epic_id = models.CharField(max_length=200, blank=True, null=True)

    m_age = models.IntegerField(blank=True, null=True)
    m_gender = models.CharField(max_length=50,blank=True, null=True)
    phone_no = models.CharField(max_length=15, blank=True, null=True)

    date_of_birth = models.DateField(blank=True, null=True)  
    religion = models.CharField(max_length=20,blank=True, null=True)
    organization = models.CharField(max_length=50,blank=True, null=True)
    org_type = models.CharField(max_length=100, null=True, blank=True)  # ← ADD THIS
    caste = models.CharField(max_length=23, blank=True, null=True)
    
    
    blood_grp = models.CharField(max_length=3, default="O+",blank=True, null=True)

    job_status = models.BooleanField(default=False,blank=True, null=True)
    job_country = models.CharField(max_length=30, blank=True, null=True)

    m_relation = models.CharField(max_length=20,blank=True, null=True)
    political_party = models.CharField(max_length=20, blank=True, null=True)
    political_type = models.CharField(max_length=20, blank=True, null=True)

    monthly_income = models.IntegerField(blank=True, null=True)
    
    m_disability = models.BooleanField(default=False,blank=True, null=True)

    m_pension = models.BooleanField(default=False,blank=True, null=True)
    pension_type = models.CharField(max_length=20, blank=True, null=True)

    m_ration_card = models.BooleanField(default=False,blank=True, null=True)
    m_ration_type = models.CharField(max_length=20, blank=True, null=True)

    marital_status = models.CharField(max_length=20, blank=True, null=True)

    m_health_insurance = models.BooleanField(default=False,blank=True, null=True)
    insurance_type = models.CharField(max_length=20, blank=True, null=True)
    has_chronic_disease = models.BooleanField(default=False,blank=True, null=True)
    chronic_disease = models.CharField(max_length=20, blank=True, null=True)


   

    # --- Election Details ---
    has_2002 = models.BooleanField(default=False,blank=True, null=True)
    has_2025 = models.BooleanField(default=False,blank=True, null=True)
    d_sir = models.BooleanField(default=False,blank=True, null=True)
    draft_sir = models.CharField(max_length=100, blank=True, null=True)
    roll_no_2002 = models.CharField(max_length=200, blank=True, null=True)
    roll_no_sec = models.CharField(max_length=100, blank=True, null=True)
    roll_no_ceo = models.CharField(max_length=100, blank=True, null=True)
    roll_no_2025 = models.CharField(max_length=100, blank=True, null=True)
    election_id = models.BooleanField(default=False,blank=True, null=True)
    g_relation = models.CharField(max_length=100, blank=True, null=True)
    ward = models.ForeignKey(
    'WardDetails',
    on_delete=models.SET_NULL,
    blank=True,
    null=True,
    related_name='ward_members'
)

    guardian_en = models.CharField(max_length=100,blank=True, null=True)
    guardian_ml = models.CharField(max_length=100,blank=True, null=True)
    voter_id_number = models.CharField(max_length=50, blank=True, null=True)
    constituency = models.ForeignKey(
    'WardDetails',
    on_delete=models.SET_NULL,
    blank=True,
    null=True,
    related_name='constituency_members'
)

    polling_booth_no = models.CharField(max_length=50, blank=True, null=True)
    
    remark = models.CharField(max_length=100, null=True, blank=True)  # ← ADD THIS

    original_house = models.ForeignKey(
        House,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="original_members"
    )

    is_active_in_house = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.m_name_en}/{self.m_name_ml} ({self.family.h_no})"
    
    @property
    def display_name(self):
        aliases = self.name_variants.filter(is_primary=False)
        if aliases.exists():
            alias_names = ", ".join(a.name_en for a in aliases)
            return f"{self.m_name_en} ({alias_names})"
        return self.m_name_en
    

class MemberHouse(models.Model):
    member = models.ForeignKey(
        Member,
        on_delete=models.CASCADE,
        related_name="house_links"
    )
    house = models.ForeignKey(
        House,
        on_delete=models.CASCADE,
        related_name="member_links"
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ("member", "house")

    

    

from django.db import models

class WardDetails(models.Model):
    posts = models.JSONField(default=list, blank=True, null=True)
    pincode = models.CharField(max_length=6, blank=True, null=True)

    constituency = models.CharField(max_length=100)
    sub_district = models.CharField(max_length=100)
    district = models.CharField(max_length=100, blank=True, null=True)
    villages = models.JSONField(default=list, blank=True, null=True)
    village_ml = models.CharField(max_length=100, blank=True, null=True)
    panchayaths = models.JSONField(default=list, blank=True, null=True)
    panchayath_ml = models.CharField(max_length=100, blank=True, null=True)
    block = models.CharField(max_length=100, blank=True, null=True)

    # ✅ JSONField supports multiple booth numbers (e.g. ["32", "33"])
    polling_booth_no = models.JSONField(default=list, blank=True, null=True)
    booth_name = models.CharField(max_length=100,blank=True,null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    ward = models.JSONField(default=list, blank=True, null=True)

    def __str__(self):
        posts_str = f"({', '.join(self.posts)})" if self.posts else ""
        booths_str = f"[{']['.join(map(str, self.polling_booth_no))}]" if self.polling_booth_no else ""
        return f"{self.panchayaths} - {self.villages} {posts_str} {booths_str}"
    

class MemberNameVariant(models.Model):
    member = models.ForeignKey(
        Member,
        on_delete=models.CASCADE,
        related_name="name_variants"
    )

    # 🔁 Alias / duplicate name
    name_en = models.CharField(max_length=200)
    name_ml = models.CharField(max_length=200, blank=True, null=True)

    normalized_name = models.CharField(
        max_length=200,
        db_index=True
    )

    # 🔗 CACHED MEMBER INFO (FOR BACKEND VIEW)
    member_name_en = models.CharField(
        max_length=200,
        help_text="Original member name (cached)"
    )
    member_name_ml = models.CharField(
        max_length=200,
        blank=True,
        null=True
    )

    voter_id = models.CharField(
        max_length=50,
        blank=True,
        null=True
    )

    guardian_en = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )
    guardian_ml = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    SOURCE_CHOICES = (
        ("excel", "Excel Import"),
        ("manual", "Manual Entry"),
        ("system", "System"),
    )
    source = models.CharField(
        max_length=20,
        choices=SOURCE_CHOICES,
        default="excel"
    )

    is_primary = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("member", "normalized_name")

    def __str__(self):
        return f"{self.member_name_en} → {self.name_en}"


    

    
    



