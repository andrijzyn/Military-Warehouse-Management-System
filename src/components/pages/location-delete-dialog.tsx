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
import type { ProductLocationView } from "@/lib/schema";
import { useLanguage } from "@/lib/i18n";

interface DeleteLocationDialogProps {
  entry: ProductLocationView | null;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
}

export function DeleteLocationDialog({
  entry,
  onClose,
  onConfirm,
  isPending,
}: DeleteLocationDialogProps) {
  const { t } = useLanguage();

  return (
    <AlertDialog open={Boolean(entry)} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("locationDeleteDialog.title")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("locationDeleteDialog.confirmMessagePart1", {
              label: entry?.location_label ?? "",
            })}{" "}
            {t.plural("locationDeleteDialog.unitsReturn", entry?.quantity ?? 0)}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            data-testid="button-confirm-delete-location"
          >
            {isPending ? t("common.removing") : t("common.remove")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
