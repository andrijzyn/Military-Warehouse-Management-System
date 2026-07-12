import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/lib/i18n";

interface ProductsFiltersProps {
  search: string;
  onSearchChange: (s: string) => void;
  categoryFilter: string;
  onCategoryChange: (c: string) => void;
  categories: string[];
}

export function ProductsFilters({
  search,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  categories,
}: ProductsFiltersProps) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder={t("productsFilters.searchPlaceholder")}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
          data-testid="input-search"
        />
      </div>

      <Select value={categoryFilter} onValueChange={onCategoryChange}>
        <SelectTrigger
          className="w-full sm:w-[180px]"
          data-testid="select-category-filter"
        >
          <SelectValue placeholder={t("productsFilters.allCategories")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("productsFilters.allCategories")}</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat} value={cat}>
              {cat}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
