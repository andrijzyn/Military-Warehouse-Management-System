"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  insertProductSchema,
  type InsertProduct,
  type Product,
} from "@/lib/schema";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  getErrorMessage,
  getErrorStatus,
  type ApiClientError,
} from "@/lib/apiClientError";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { useLanguage, type Translate } from "@/lib/i18n";

interface ProductFormProps {
  product?: Product;
  onClose: () => void;
}

function getProductMutationMessage(error: unknown, t: Translate) {
  const status = getErrorStatus(error);
  if (status === 403) return t("productForm.forbidden");
  if (status === 409) return t("productForm.skuConflict");
  return getErrorMessage(error);
}

export default function ProductForm({ product, onClose }: ProductFormProps) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const isEditing = !!product;

  const form = useForm<InsertProduct>({
    resolver: zodResolver(insertProductSchema) as Resolver<InsertProduct>,
    defaultValues: {
      name: product?.name ?? "",
      sku: product?.sku ?? "",
      category: product?.category ?? "",
      quantity: product?.quantity ?? 0,
      price: product?.price ?? 0,
      low_stock_threshold: product?.low_stock_threshold ?? 10,
      description: product?.description ?? "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertProduct) => {
      if (isEditing) {
        await apiRequest("PATCH", `/api/products/${product.id}`, data);
      } else {
        await apiRequest("POST", "/api/products", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });

      toast({
        title: isEditing
          ? t("productForm.updatedToastTitle")
          : t("productForm.createdToastTitle"),
        description: isEditing
          ? t("productForm.updatedToastDescription")
          : t("productForm.createdToastDescription"),
      });

      onClose();
    },
    onError: (error: ApiClientError) => {
      toast({
        title:
          getErrorStatus(error) === 403
            ? t("common.accessDenied")
            : t("common.error"),
        description: getProductMutationMessage(error, t),
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: InsertProduct) {
    mutation.mutate(data);
  }

  return (
    <div className="space-y-5" data-testid="product-form-page">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          data-testid="button-back"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div>
          <h1
            className="text-xl font-semibold tracking-tight"
            data-testid="text-form-title"
          >
            {isEditing ? t("productForm.editTitle") : t("products.addProduct")}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {isEditing
              ? t("productForm.editSubtitle")
              : t("productForm.addSubtitle")}
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("productForm.nameLabel")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("productForm.namePlaceholder")}
                          {...field}
                          data-testid="input-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("fields.sku")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("productForm.skuPlaceholder")}
                          {...field}
                          data-testid="input-sku"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("fields.category")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("productForm.categoryPlaceholder")}
                        {...field}
                        data-testid="input-category"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
                          step="1"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value, 10) || 0)
                          }
                          data-testid="input-quantity"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("productForm.priceLabel")}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                          data-testid="input-price"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="low_stock_threshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("productForm.lowStockLabel")}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value, 10) || 0)
                          }
                          data-testid="input-threshold"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("productForm.descriptionLabel")}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t("productForm.descriptionPlaceholder")}
                        rows={3}
                        {...field}
                        value={field.value ?? ""}
                        data-testid="input-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  data-testid="button-submit"
                >
                  {mutation.isPending
                    ? isEditing
                      ? t("productForm.updating")
                      : t("common.creating")
                    : isEditing
                      ? t("productForm.updateProduct")
                      : t("productForm.createProduct")}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  data-testid="button-cancel"
                >
                  {t("common.cancel")}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
