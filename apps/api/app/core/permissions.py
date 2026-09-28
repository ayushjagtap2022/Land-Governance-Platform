"""
Granular Permission Matrix for the Land Governance Platform.

Maps each UserRole to the set of actions they are allowed to perform.
This is referenced by the `require_permission()` dependency in routes
to enforce access control at the endpoint level.
"""
from enum import Enum


class Permission(str, Enum):
    # Document / Repository permissions
    VIEW_PUBLIC_DOCS        = "view_public_docs"
    DOWNLOAD_DOCS           = "download_docs"
    UPLOAD_DOCS             = "upload_docs"
    EDIT_OWN_DOCS           = "edit_own_docs"
    DELETE_OWN_DOCS         = "delete_own_docs"
    
    # Simulation permissions
    RUN_SIMULATIONS         = "run_simulations"
    
    # Analytics permissions
    VIEW_ANALYTICS          = "view_analytics"
    
    # Workspace / Collaboration permissions
    CREATE_WORKSPACE        = "create_workspace"
    MANAGE_WORKSPACE        = "manage_workspace"
    
    # Admin permissions
    MANAGE_USERS            = "manage_users"
    MODERATE_CONTENT        = "moderate_content"
    VIEW_AUDIT_LOGS         = "view_audit_logs"
    VIEW_PLATFORM_HEALTH    = "view_platform_health"


# ---------------------------------------------------------------------------
# Role → Permission mapping
# Derived directly from the project PDF's permission requirements.
# ---------------------------------------------------------------------------
ROLE_PERMISSIONS: dict[str, set[Permission]] = {
    "public": {
        Permission.VIEW_PUBLIC_DOCS,
    },
    
    "researcher": {
        Permission.VIEW_PUBLIC_DOCS,
        Permission.DOWNLOAD_DOCS,
        Permission.UPLOAD_DOCS,
        Permission.EDIT_OWN_DOCS,
        Permission.RUN_SIMULATIONS,
        Permission.VIEW_ANALYTICS,
        Permission.CREATE_WORKSPACE,
    },
    
    "official": {
        Permission.VIEW_PUBLIC_DOCS,
        Permission.DOWNLOAD_DOCS,
        Permission.UPLOAD_DOCS,
        Permission.EDIT_OWN_DOCS,
        Permission.DELETE_OWN_DOCS,
        Permission.RUN_SIMULATIONS,
        Permission.VIEW_ANALYTICS,
        Permission.CREATE_WORKSPACE,
        Permission.MANAGE_WORKSPACE,
    },
    
    "institution": {
        Permission.VIEW_PUBLIC_DOCS,
        Permission.DOWNLOAD_DOCS,
        Permission.UPLOAD_DOCS,
        Permission.EDIT_OWN_DOCS,
        Permission.DELETE_OWN_DOCS,
        Permission.VIEW_ANALYTICS,
        Permission.CREATE_WORKSPACE,
        Permission.MANAGE_WORKSPACE,
    },
    
    "super_admin": {
        # Super Admin has ALL permissions
        Permission.VIEW_PUBLIC_DOCS,
        Permission.DOWNLOAD_DOCS,
        Permission.UPLOAD_DOCS,
        Permission.EDIT_OWN_DOCS,
        Permission.DELETE_OWN_DOCS,
        Permission.RUN_SIMULATIONS,
        Permission.VIEW_ANALYTICS,
        Permission.CREATE_WORKSPACE,
        Permission.MANAGE_WORKSPACE,
        Permission.MANAGE_USERS,
        Permission.MODERATE_CONTENT,
        Permission.VIEW_AUDIT_LOGS,
        Permission.VIEW_PLATFORM_HEALTH,
    },
}


def has_permission(role: str, permission: Permission) -> bool:
    """Check if a given role has a specific permission."""
    role_perms = ROLE_PERMISSIONS.get(role, set())
    return permission in role_perms
