import os
import re

# 1. Update admins.ts
admin_path = "src/config/admins.ts"
with open(admin_path, "r") as f:
    content = f.read()
content = content.replace("export const isSuperAdmin", "export const checkIsSuperAdmin")
with open(admin_path, "w") as f:
    f.write(content)

# 2. Update files that had naming collision
files_to_update = [
    "src/components/CompanyDashboard.tsx",
    "src/components/MaintenanceGuard.tsx",
    "src/components/AdminRoute.tsx",
    "src/components/AdminDashboard.tsx",
    "src/components/TeamCrmTab.tsx",
    "src/components/TrialGuard.tsx",
    "src/components/NotificationCenter.tsx",
    "src/components/Login.tsx",
    "src/utils/planFeatures.ts",
    "src/contexts/ProjectContext.tsx",
]

for file_path in files_to_update:
    if not os.path.exists(file_path):
        continue
    with open(file_path, "r") as f:
        content = f.read()
        
    content = content.replace("import { isSuperAdmin }", "import { checkIsSuperAdmin }")
    content = content.replace("= isSuperAdmin(", "= checkIsSuperAdmin(")
    content = re.sub(r'([!(\s])isSuperAdmin\(', r'\1checkIsSuperAdmin(', content)

    with open(file_path, "w") as f:
        f.write(content)

