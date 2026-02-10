from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Count

from django.contrib.auth import get_user_model
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from Survey.models import (
    Family, House, Member, MadrasaDetails, MemberEducation,WardDetails,Cluster
)
from Survey.serializers import (
    FamilySerializer, HouseSerializer, MemberSerializer,
    UserSerializer, MadrasaDetailsSerializer,MemberEducationSerializer,WardDetailsSerializer,ClusterSerializer
)
from Survey.models import MemberHouse


User = get_user_model()

# ------------------ JWT ------------------
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        data['user'] = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "user_type": user.user_type,
            "department": user.department if user.department else None
        }
        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer



class ClusterViewSet(viewsets.ModelViewSet):
    queryset = Cluster.objects.prefetch_related("house_set__family").all()
    serializer_class = ClusterSerializer

    def get_queryset(self):
        """
        Optionally filter clusters by ward or other criteria later if needed.
        """
        return super().get_queryset()




# ------------------ USER ------------------
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class WardDetailsViewSet(viewsets.ModelViewSet):
    queryset = WardDetails.objects.all().order_by('-created_at')
    serializer_class = WardDetailsSerializer



# ------------------ FAMILY ------------------
class FamilyViewSet(viewsets.ModelViewSet):
    queryset = Family.objects.all()
    serializer_class = FamilySerializer

from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
# ------------------ HOUSE ------------------
# ------------------ HOUSE ------------------
class HouseViewSet(viewsets.ModelViewSet):
    queryset = House.objects.select_related("family", "cluster").all()
    serializer_class = HouseSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        # ✅ Filter by family_id if given
        family_id = self.request.query_params.get("family_id")
        if family_id:
            queryset = queryset.filter(family_id=family_id)

        # ✅ Filter by cluster id (for ViewClusterHouses)
        cluster_id = self.request.query_params.get("cluster")
        if cluster_id:
            queryset = queryset.filter(cluster_id=cluster_id)

        return queryset
    
    @action(detail=False, methods=['put'], url_path='update-cluster')
    def update_cluster(self, request):
        house_ids = request.data.get('house_ids', [])
        cluster_id = request.data.get('cluster_id')

        if not house_ids or not cluster_id:
            return Response(
                {"error": "house_ids and cluster_id are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Update all selected houses
        updated = House.objects.filter(id__in=house_ids).update(cluster_id=cluster_id)

        return Response(
            {"message": f"{updated} houses updated successfully"},
            status=status.HTTP_200_OK
        )




# ------------------ MEMBER ------------------
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status

# ------------------ MEMBER ------------------
from django.db.models import Q

from .models import Member, House
from .serializers import MemberSerializer


class MemberViewSet(viewsets.ModelViewSet):
    """
    Member ViewSet

    ✔ Family അടിസ്ഥാനത്തിൽ members list ചെയ്യാം
    ✔ House page-ൽ:
        - This house-il active members
        - + family members not assigned to any other house
    ✔ Member assign / reassign to house
    """

    queryset = Member.objects.select_related("family", "house").all()
    serializer_class = MemberSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        family_id = self.request.query_params.get("family")
        house_id = self.request.query_params.get("house")

        # ✅ HOUSE PAGE LOGIC (FINAL & CORRECT)
        if house_id:
            try:
                house = House.objects.select_related("family").get(id=house_id)
            except House.DoesNotExist:
                return queryset.none()

            queryset = queryset.filter(
                # Members currently active in THIS house
                Q(
                    house_id=house_id,
                    is_active_in_house=True
                )
                |
                # Family members NOT assigned to any other house
                Q(
                    family_id=house.family_id,
                    house__isnull=True
                )
            ).distinct()

        # ✅ FAMILY PAGE LOGIC (show ALL family members)
        elif family_id:
            queryset = queryset.filter(
                family_id=family_id
            )

        return queryset

    @action(detail=True, methods=["put"], url_path="assign-house")
    def assign_house(self, request, pk=None):
        """
        Assign / Re-assign a member to a house.

        ✔ Old house membership removed
        ✔ Member added to new house
        ✔ Only ONE active house per member
        ✔ MemberHouse history maintained
        """
        try:
            member = self.get_object()
            house_id = request.data.get("house_id")

            if not house_id:
                return Response(
                    {"error": "house_id is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            try:
                new_house = House.objects.get(id=house_id)
            except House.DoesNotExist:
                return Response(
                    {"error": "House not found"},
                    status=status.HTTP_404_NOT_FOUND
                )

            # 🔴 1. Deactivate ALL old house links
            MemberHouse.objects.filter(
                member=member,
                is_active=True
            ).update(is_active=False)

            # 🔴 2. Clear old house reference
            member.house = None
            member.is_active_in_house = False
            member.save(update_fields=["house", "is_active_in_house"])

            # 🔴 3. Assign to NEW house
            member.house = new_house
            member.is_active_in_house = True
            member.save(update_fields=["house", "is_active_in_house"])

            # 🔴 4. Activate MemberHouse link
            MemberHouse.objects.update_or_create(
                member=member,
                house=new_house,
                defaults={"is_active": True}
            )

            return Response(
                {
                    "message": "Member successfully transferred to new house",
                    "member_id": member.id,
                    "house_id": new_house.id,
                },
                status=status.HTTP_200_OK
            )

        except Exception as e:
            print("Assign Error:", e)
            return Response(
                {"error": "Internal Server Error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
@api_view(["GET"])
def voters(request):
    voters = Member.objects.filter(election_id=True)
    serializer = MemberSerializer(voters, many=True)
    return Response(serializer.data)


# ------------------ MADRASA DETAILS ------------------
class MadrasaDetailsViewSet(viewsets.ModelViewSet):
    queryset = MadrasaDetails.objects.all()
    serializer_class = MadrasaDetailsSerializer

class MemberEducationViewSet(viewsets.ModelViewSet):
    queryset = MemberEducation.objects.select_related("member").all()
    serializer_class = MemberEducationSerializer    


@api_view(['PUT'])
def update_cluster(request):
    house_ids = request.data.get("house_ids", [])
    cluster_id = request.data.get("cluster_id")

    if not house_ids or not cluster_id:
        return Response({"error": "Missing data"}, status=400)

    House.objects.filter(id__in=house_ids).update(cluster_id=cluster_id)
    return Response({"success": True})


# ------------------ REPORT API ------------------
@api_view(['GET'])
def report(request):
    house_count = Family.objects.values("h_no").distinct().count()
    member_count = Member.objects.count()
    family_count = Family.objects.count()

    # Prefetch members to avoid N+1 queries
    families = Family.objects.prefetch_related("members").all()
    houses_data = [
        {
            "family_name_en": f.family_name_en,
            "family_name_ml": f.family_name_ml,
            "h_no": f.h_no,
            "sub": f.sub,
            "member_count": f.members.count()
        }
        for f in families
    ]

    # Education summary now from MemberEducation model
    qs = MemberEducation.objects.values("education", "education_status").annotate(total=Count("id"))

    summary = {}
    for row in qs:
        level = row["education"]
        status = (row["education_status"] or "").lower()
        total = row["total"]

        if level not in summary:
            summary[level] = {"name": level, "passed": 0, "failed": 0, "studying": 0}

        if status == "passed":
            summary[level]["passed"] += total
        elif status == "failed":
            summary[level]["failed"] += total
        elif status == "studying":
            summary[level]["studying"] += total

    # fixed order
    levels = ["10th", "+1", "+2", "UG", "PG", "PhD"]
    education_summary = [summary[l] for l in levels if l in summary]

    return Response({
        "house_count": house_count,
        "member_count": member_count,
        "family_count": family_count,
        "houses": houses_data,
        "education_summary": education_summary
    })
