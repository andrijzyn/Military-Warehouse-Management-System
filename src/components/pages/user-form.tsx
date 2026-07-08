"use client";

import type { InsertUser, UpdateUser } from "@/lib/schema";
import {
  MILITARY_RANKS,
  CLEARANCE_LEVELS,
  insertUserSchema,
  updateUserSchema,
} from "@/lib/schema";
import { PERMISSIONS } from "@/lib/permissions";
import type { Permission } from "@/lib/permissions";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import {
  useLanguage,
  translateRank,
  translateClearance,
  type TranslationKey,
} from "@/lib/i18n";

const PERMISSION_GROUPS: { labelKey: TranslationKey; perms: Permission[] }[] = [
  {
    labelKey: "userForm.readGroup",
    perms: [
      PERMISSIONS.READ_PRODUCTS,
      PERMISSIONS.READ_LOCATIONS,
      PERMISSIONS.READ_USERS,
      PERMISSIONS.READ_DEBUG,
      PERMISSIONS.READ_LOGS,
    ],
  },
  {
    labelKey: "userForm.writeGroup",
    perms: [
      PERMISSIONS.WRITE_PRODUCTS,
      PERMISSIONS.WRITE_LOCATIONS,
      PERMISSIONS.WRITE_USERS,
    ],
  },
  {
    labelKey: "userForm.deleteGroup",
    perms: [
      PERMISSIONS.DELETE_PRODUCTS,
      PERMISSIONS.DELETE_LOCATIONS,
      PERMISSIONS.DELETE_USERS,
    ],
  },
];

const PERMISSION_LABEL_KEYS: Record<Permission, TranslationKey> = {
  read_products: "nav.products",
  read_locations: "nav.locations",
  read_users: "nav.users",
  read_debug: "userForm.debugLabel",
  read_logs: "permissionDots.logs",
  write_products: "nav.products",
  write_locations: "nav.locations",
  write_users: "nav.users",
  delete_products: "nav.products",
  delete_locations: "nav.locations",
  delete_users: "nav.users",
};

type UserFormValues = {
  username: string;
  password: string;
  full_name: string;
  rank: string;
  unit: string;
  callsign: string;
  clearance_level: string;
  permissions: Permission[];
  is_active: boolean;
};

type CreateUserFormProps = {
  isEdit?: false;
  onSubmit: (data: InsertUser) => void;
  defaultValues?: Partial<InsertUser>;
  isPending?: boolean;
};

type EditUserFormProps = {
  isEdit: true;
  onSubmit: (data: UpdateUser) => void;
  defaultValues?: Partial<UpdateUser>;
  isPending?: boolean;
};

type UserFormProps = CreateUserFormProps | EditUserFormProps;

export default function UserForm(props: UserFormProps) {
  const { t } = useLanguage();
  const form = useForm<UserFormValues>({
    resolver: zodResolver(
      props.isEdit ? updateUserSchema : insertUserSchema,
    ) as Resolver<UserFormValues>,
    defaultValues: {
      username: props.defaultValues?.username ?? "",
      password: "",
      full_name: props.defaultValues?.full_name ?? "",
      rank: props.defaultValues?.rank ?? "",
      unit: props.defaultValues?.unit ?? "",
      callsign:
        typeof props.defaultValues?.callsign === "string"
          ? props.defaultValues.callsign
          : "",
      clearance_level: props.defaultValues?.clearance_level ?? "No clearance",
      permissions: props.defaultValues?.permissions ?? [],
      is_active: props.defaultValues?.is_active ?? true,
    },
  });

  function handleSubmit(data: UserFormValues) {
    const password = data.password?.trim();
    const basePayload = {
      username: data.username.trim(),
      full_name: data.full_name.trim(),
      rank: data.rank,
      unit: data.unit,
      callsign: data.callsign?.trim() || null,
      clearance_level: data.clearance_level,
      permissions: data.permissions,
      is_active: data.is_active,
    };

    if (props.isEdit) {
      props.onSubmit({
        ...basePayload,
        ...(password ? { password } : {}),
      });
      return;
    }

    props.onSubmit({
      ...basePayload,
      password: password ?? "",
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("fields.username")}</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {props.isEdit
                  ? t("userForm.newPasswordLabel")
                  : t("fields.password")}
              </FormLabel>
              <FormControl>
                <Input type="password" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("fields.fullName")}</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="rank"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("fields.rank")}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value ?? ""}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("userForm.selectRankPlaceholder")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {MILITARY_RANKS.map((rank) => (
                    <SelectItem key={rank} value={rank}>
                      {translateRank(t, rank)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="unit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("fields.unit")}</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="callsign"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("userForm.callsignLabel")}</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="clearance_level"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("userForm.clearanceLevelLabel")}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value ?? ""}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("userForm.selectClearancePlaceholder")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CLEARANCE_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {translateClearance(t, level)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="permissions"
          render={({ field }) => {
            const current = field.value ?? [];

            return (
              <FormItem>
                <FormLabel>{t("fields.permissions")}</FormLabel>
                <div className="space-y-3 rounded-md border p-3">
                  {PERMISSION_GROUPS.map((group) => (
                    <div key={group.labelKey}>
                      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {t(group.labelKey)}
                      </p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                        {group.perms.map((perm) => {
                          const checked = current.includes(perm);

                          return (
                            <label
                              key={perm}
                              className="flex cursor-pointer select-none items-center gap-2 text-sm"
                            >
                              <Checkbox
                                checked={checked}
                                onCheckedChange={(value) => {
                                  const next =
                                    value === true
                                      ? Array.from(new Set([...current, perm]))
                                      : current.filter((p) => p !== perm);

                                  field.onChange(next);
                                }}
                              />
                              {t(PERMISSION_LABEL_KEYS[perm])}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-md border p-3">
              <FormLabel className="mb-0">{t("common.active")}</FormLabel>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={props.isPending}>
          {props.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {props.isEdit ? t("common.saving") : t("common.creating")}
            </>
          ) : props.isEdit ? (
            t("userForm.saveChanges")
          ) : (
            t("userForm.createUser")
          )}
        </Button>
      </form>
    </Form>
  );
}
