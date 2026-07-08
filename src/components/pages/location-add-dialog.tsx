import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { UseFormReturn } from "react-hook-form";
import type { InsertProductLocation } from "@/lib/schema";
import { LocationSearch } from "./location-search";
import { useLanguage } from "@/lib/i18n";

interface AddLocationDialogProps {
  open: boolean;
  onClose: () => void;
  form: UseFormReturn<InsertProductLocation>;
  onSubmit: (data: InsertProductLocation) => void;
  usedLocationIds: string[];
  isPending: boolean;
}

export function AddLocationDialog({
  open,
  onClose,
  form,
  onSubmit,
  usedLocationIds,
  isPending,
}: AddLocationDialogProps) {
  const { t } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("locationForm.addLocation")}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="location_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("locationAddDialog.locationLabel")}</FormLabel>
                  <FormControl>
                    <LocationSearch
                      value={field.value}
                      onChange={field.onChange}
                      excludeIds={usedLocationIds}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.quantity")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                      data-testid="input-location-quantity"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center gap-3 pt-1">
              <Button
                type="submit"
                disabled={isPending}
                data-testid="button-submit-location"
              >
                {isPending ? t("common.adding") : t("common.add")}
              </Button>
              <Button type="button" variant="ghost" onClick={onClose}>
                {t("common.cancel")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
