export interface AdminUser {
  id: number;
  username: string;
  displayName: string;
  email: string;
  provider: string;
  status: string;
  roles: string[];
  permissions: string[];
  createdAt: string | null;
}

export interface PermissionCatalogItem {
  code: string;
  label: string;
}
