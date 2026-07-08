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
import type { Product } from "@/lib/schema";
import { useLanguage } from "@/lib/i18n";

interface DeleteProductDialogProps {
  product: Product | null;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
}

export function DeleteProductDialog({
  product,
  onClose,
  onConfirm,
  isPending,
}: DeleteProductDialogProps) {
  const { t } = useLanguage();

  return (
    <AlertDialog open={Boolean(product)} onOpenChange={() => onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("productsDeleteDialog.title")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("productsDeleteDialog.confirmMessage", {
              name: product?.name ?? "",
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel data-testid="button-cancel-delete">
            {t("common.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            data-testid="button-confirm-delete"
          >
            {isPending ? t("common.deleting") : t("common.delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
