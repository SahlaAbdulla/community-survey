from rest_framework import serializers
from .models import (
    Family, House, Member, User, MadrasaDetails, MemberEducation,WardDetails,Cluster,MemberNameVariant
)

# ------------------ User ------------------
class UserSerializer(serializers.ModelSerializer):
    department = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    phone_no = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "phone_no", "password", "user_type", "department"]

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        if not password:
            raise serializers.ValidationError({"password": "Password is required for new user"})

        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:   # only if provided
            instance.set_password(password)

        instance.save()
        return instance


# ------------------ Family ------------------
class FamilySerializer(serializers.ModelSerializer):
    class Meta:
        model = Family
        fields = ["id", "family_name_en", "family_name_ml", "h_no", "sub"]


class ClusterHouseSerializer(serializers.ModelSerializer):
    family_name_en = serializers.CharField(source="family.family_name_en", read_only=True)
    family_name_ml = serializers.CharField(source="family.family_name_ml", read_only=True)
    h_no = serializers.CharField(source="family.h_no", read_only=True)

    class Meta:
        model = House
        fields = [
            "id",
            "owner_en",
            "owner_ml",
            "family_name_en",
            "family_name_ml",
            "h_no",
        ]


class ClusterSerializer(serializers.ModelSerializer):
    houses = ClusterHouseSerializer(source="house_set", many=True, read_only=True)

    class Meta:
        model = Cluster
        fields = ["id", "name_english", "name_malayalam", "houses"]

# ------------------ House ------------------
# ------------------ House ------------------
class HouseSerializer(serializers.ModelSerializer):
    family_name_en = serializers.CharField(source="family.family_name_en", read_only=True)
    family_name_ml = serializers.CharField(source="family.family_name_ml", read_only=True)
    h_no = serializers.CharField(source="family.h_no", read_only=True)
    sub = serializers.CharField(source="family.sub", read_only=True)

    cluster = ClusterSerializer(read_only=True)
    cluster_id = serializers.PrimaryKeyRelatedField(
        queryset=Cluster.objects.all(),
        source="cluster",
        write_only=True,
        required=False,
        allow_null=True
    )

    # 🔥 FIX 2: h_address optional
    h_address = serializers.CharField(
        required=False,
        allow_blank=True,
        allow_null=True
    )

    # ✅ Corrected fields
    total_voters = serializers.SerializerMethodField()
    total_members = serializers.SerializerMethodField()

    class Meta:
        model = House
        fields = "__all__"

    def get_total_voters(self, obj):
        # ✅ Members filtered through family
        return obj.family.members.filter(election_id=True).count()

    def get_total_members(self, obj):
        # ✅ All family members
        return obj.family.members.count()


# ------------------ Madrasa Details ------------------
class MadrasaDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = MadrasaDetails
        fields = "__all__"


# ------------------ Member Education ------------------
# ------------------ Member Education ------------------
class MemberEducationSerializer(serializers.ModelSerializer):
    education = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    education_status = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    education_stream = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = MemberEducation
        fields = ['id', 'education', 'education_status', 'education_stream']


class MemberNameVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = MemberNameVariant
        fields = ["id", "name_en", "name_ml", "is_primary"]



# ------------------ Member ------------------
class MemberSerializer(serializers.ModelSerializer):

    display_name_en = serializers.CharField(read_only=True)
    display_name_ml = serializers.CharField(read_only=True)
    name_variants = MemberNameVariantSerializer(many=True, read_only=True)
    m_name_en = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    m_name_ml = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    educations = MemberEducationSerializer(many=True, required=False)
    madrasa_details = MadrasaDetailsSerializer(read_only=True, required=False)

    family_id = serializers.PrimaryKeyRelatedField(
        queryset=Family.objects.all(),
        source="family",
        write_only=True,
        required=False,
        allow_null=True
    )

    # ✅ READ-ONLY FAMILY INFO
    family_name_en = serializers.CharField(source="family.family_name_en", read_only=True)
    family_name_ml = serializers.CharField(source="family.family_name_ml", read_only=True)
    h_no = serializers.CharField(source="family.h_no", read_only=True)
    sub = serializers.CharField(source="family.sub", read_only=True)

    # 🔥 🔥 THIS IS THE FIX 🔥 🔥
    house = HouseSerializer(read_only=True)
    house_id = serializers.IntegerField(source="house.id", read_only=True)

    class Meta:
        model = Member
        fields = "__all__"
        extra_kwargs = {
            "family": {"required": False, "allow_null": True},
        }

    def create(self, validated_data):
        educations_data = validated_data.pop("educations", [])
        member = Member.objects.create(**validated_data)

        # Create educations only if data exists
        for edu_data in educations_data:
            if any(edu_data.values()):
                MemberEducation.objects.create(member=member, **edu_data)
        return member

    def update(self, instance, validated_data):
        educations_data = validated_data.pop("educations", [])
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        instance.educations.all().delete()
        for edu_data in educations_data:
            if any(edu_data.values()):
                MemberEducation.objects.create(member=instance, **edu_data)
        return instance

    
class WardDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = WardDetails
        fields = '__all__'

    def to_internal_value(self, data):
        # Debug print
        print("Incoming data:", data)
        return super().to_internal_value(data)
    



