from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    FamilyViewSet, HouseViewSet, MemberViewSet, UserViewSet,MemberEducationViewSet,
    
    report, CustomTokenObtainPairView,MadrasaDetailsViewSet,WardDetailsViewSet,ClusterViewSet,voters
)
from rest_framework_simplejwt.views import TokenRefreshView

router = DefaultRouter()
router.register(r'families', FamilyViewSet)
router.register(r'houses', HouseViewSet)
router.register(r'members', MemberViewSet)
router.register(r'users', UserViewSet)
router.register(r'madrasa-details', MadrasaDetailsViewSet)
router.register(r'education', MemberEducationViewSet)
router.register(r'wards', WardDetailsViewSet)
router.register(r'clusters', ClusterViewSet)



urlpatterns = [
    path('', include(router.urls)),
    path('report/', report, name='report'),
    path('members/voters/', voters, name='voters-list'),
    
   


    # JWT Auth
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
