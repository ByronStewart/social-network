from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Object-level permission to only allow owners to edit it
    Assumes model has an 'owner' property
    """

    def has_object_permission(self, request, view, obj):
        """ 
        Will allow GET, HEAD, or OPTIONS requests.
        """
        if request.method in permissions.SAFE_METHODS:
            return True

        return obj.owner == request.user
