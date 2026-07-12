"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getErrorMessage } from "@/lib/apiClientError";
import { useAuth } from "@/hooks/use-auth";
import type { InsertUser, UpdateUser } from "@/lib/schema";
import type { SafeUser } from "@/lib/userTypes";
import { PERMISSIONS } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Pencil, Trash2 } from "lucide-react";
import UserForm from "@/components/pages/user-form";
import {
  PermissionDots,
  PermissionDotsHint,
} from "@/components/pages/permission-dots";
import { useLanguage, translateRank, translateClearance } from "@/lib/i18n";

function clearanceBadgeVariant(level: string) {
  switch (level) {
    case "Top secret":
    case "Special importance":
      return "destructive";
    case "Secret":
      return "default";
    case "For official use only":
      return "secondary";
    default:
      return "outline";
  }
}

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editUser, setEditUser] = useState<SafeUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SafeUser | null>(null);

  const {
    data: users = [],
    isLoading,
    isError,
    error,
  } = useQuery<SafeUser[]>({
    queryKey: ["/api/users"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertUser) => {
      const res = await apiRequest("POST", "/api/users", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setDialogOpen(false);
      toast({ title: t("users.createdToast") });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: error.message,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateUser }) => {
      const payload = { ...data };
      if (!payload.password) delete payload.password;
      const res = await apiRequest("PATCH", `/api/users/${id}`, payload);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setEditUser(null);
      toast({ title: t("users.savedToast") });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: error.message,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setDeleteTarget(null);
      toast({ title: t("users.deletedToast") });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: error.message,
      });
    },
  });

  const activeCount = users.filter((u) => u.is_active).length;

  return (
    <div className="space-y-5" data-testid="users-page">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-xl font-semibold tracking-tight"
            data-testid="text-page-title"
          >
            {t("users.title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("users.subtitle")}
          </p>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          size="sm"
          data-testid="button-add-user"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          {t("common.add")}
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { id: "total", label: t("users.totalLabel"), value: users.length },
          { id: "active", label: t("users.activeLabel"), value: activeCount },
        ].map(({ id, label, value }) => (
          <Card key={id}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-2xl font-semibold tabular-nums">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : isError ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-sm text-destructive">
                {getErrorMessage(error, t("users.loadError"))}
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("users.fullNameHeader")}</TableHead>
                  <TableHead>{t("fields.rank")}</TableHead>
                  <TableHead>{t("fields.unit")}</TableHead>
                  <TableHead>{t("users.callsignHeader")}</TableHead>
                  <TableHead>{t("users.clearanceHeader")}</TableHead>
                  <TableHead>
                    <span className="inline-flex items-center gap-1.5">
                      {t("fields.permissions")}
                      <PermissionDotsHint />
                    </span>
                  </TableHead>
                  <TableHead>{t("fields.status")}</TableHead>
                  <TableHead className="w-[80px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id} data-testid={`row-user-${u.id}`}>
                    <TableCell>
                      <p className="text-sm font-medium">{u.full_name}</p>
                      <p className="text-xs text-muted-foreground">
                        @{u.username}
                      </p>
                    </TableCell>
                    <TableCell className="text-sm">{translateRank(t, u.rank)}</TableCell>
                    <TableCell className="text-sm">{u.unit}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {u.callsign || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={clearanceBadgeVariant(u.clearance_level)}>
                        {translateClearance(t, u.clearance_level)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <PermissionDots permissions={u.permissions} />
                    </TableCell>
                    <TableCell>
                      <Badge variant={u.is_active ? "default" : "secondary"}>
                        {u.is_active ? t("common.active") : t("common.inactive")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setEditUser(u)}
                          data-testid={`button-edit-user-${u.id}`}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        {currentUser?.id !== u.id && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDeleteTarget(u)}
                            data-testid={`button-delete-user-${u.id}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("users.newUserDialogTitle")}</DialogTitle>
            <DialogDescription>
              {t("users.newUserDialogDescription")}
            </DialogDescription>
          </DialogHeader>
          <UserForm
            onSubmit={(data) => createMutation.mutate(data)}
            isPending={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editUser}
        onOpenChange={(open) => !open && setEditUser(null)}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {t("users.editDialogTitle", { name: editUser?.full_name ?? "" })}
            </DialogTitle>
            <DialogDescription>
              {t("users.editDialogDescription")}
            </DialogDescription>
          </DialogHeader>
          {editUser && (
            <UserForm
              isEdit
              defaultValues={{
                username: editUser.username,
                password: "",
                full_name: editUser.full_name,
                rank: editUser.rank,
                unit: editUser.unit,
                callsign: editUser.callsign ?? "",
                clearance_level: editUser.clearance_level,
                permissions: editUser.permissions,
                is_active: editUser.is_active,
              }}
              onSubmit={(data) =>
                updateMutation.mutate({
                  id: editUser.id,
                  data,
                })
              }
              isPending={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("users.deleteDialogTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("users.deleteDialogDescription", {
                name: deleteTarget?.full_name ?? "",
                username: deleteTarget?.username ?? "",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteTarget && deleteMutation.mutate(deleteTarget.id)
              }
              data-testid="button-confirm-delete"
            >
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
