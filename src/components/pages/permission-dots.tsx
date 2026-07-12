import { Info } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PERMISSIONS, type Permission } from "@/lib/permissions";
import { useLanguage, type TranslationKey } from "@/lib/i18n";

type AccessLevel = "none" | "read" | "write";

interface PermissionResource {
  id: string;
  labelKey: TranslationKey;
  read: Permission;
  write?: Permission;
  del?: Permission;
}

const RESOURCES: PermissionResource[] = [
  {
    id: "products",
    labelKey: "nav.products",
    read: PERMISSIONS.READ_PRODUCTS,
    write: PERMISSIONS.WRITE_PRODUCTS,
    del: PERMISSIONS.DELETE_PRODUCTS,
  },
  {
    id: "locations",
    labelKey: "nav.locations",
    read: PERMISSIONS.READ_LOCATIONS,
    write: PERMISSIONS.WRITE_LOCATIONS,
    del: PERMISSIONS.DELETE_LOCATIONS,
  },
  {
    id: "users",
    labelKey: "nav.users",
    read: PERMISSIONS.READ_USERS,
    write: PERMISSIONS.WRITE_USERS,
    del: PERMISSIONS.DELETE_USERS,
  },
  { id: "logs", labelKey: "permissionDots.logs", read: PERMISSIONS.READ_LOGS },
];

const levelStyles: Record<AccessLevel, string> = {
  none: "bg-rose-500",
  read: "bg-amber-500",
  write: "bg-emerald-500",
};

const levelLabelKeys: Record<AccessLevel, TranslationKey> = {
  none: "permissionDots.noAccess",
  read: "permissionDots.canView",
  write: "permissionDots.canEdit",
};

function accessLevel(
  permissions: Permission[],
  resource: PermissionResource,
): AccessLevel {
  if (
    (resource.write && permissions.includes(resource.write)) ||
    (resource.del && permissions.includes(resource.del))
  ) {
    return "write";
  }
  if (permissions.includes(resource.read)) return "read";
  return "none";
}

export function PermissionDotsHint() {
  const { t } = useLanguage();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex cursor-help text-muted-foreground"
          aria-label={t("permissionDots.hintAriaLabel")}
          data-testid="permission-dots-hint"
        >
          <Info className="h-3.5 w-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2 text-xs" sideOffset={4}>
        {t("permissionDots.hintPrefix", {
          list: RESOURCES.map((r) => t(r.labelKey)).join(", "),
        })}
      </PopoverContent>
    </Popover>
  );
}

export function PermissionDots({ permissions }: { permissions: Permission[] }) {
  const { t } = useLanguage();

  return (
    <div className="flex items-center gap-1.5" data-testid="permission-dots">
      {RESOURCES.map((resource) => {
        const level = accessLevel(permissions, resource);

        return (
          <Tooltip key={resource.id}>
            <TooltipTrigger asChild>
              <span
                className={`h-2.5 w-2.5 shrink-0 rounded-full ${levelStyles[level]}`}
                data-testid={`permission-dot-${resource.id}-${level}`}
              />
            </TooltipTrigger>
            <TooltipContent>
              {t(resource.labelKey)}: {t(levelLabelKeys[level])}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
