import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Trash2 } from "lucide-react";

interface RestockRow {
  store_id: number;
  product_id: number;
  quantity: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  storeId: number | null;
  isAdmin: boolean;
  onRefreshMv: () => Promise<void>;
}

export function RestockModal({ open, onClose, storeId, isAdmin, onRefreshMv }: Props) {
  const [rows, setRows] = useState<RestockRow[]>([
    { store_id: storeId ?? 1, product_id: 0, quantity: 0 },
  ]);

  const restockMutation = useMutation({
    mutationFn: (items: RestockRow[]) => api.inventory.restock(items),
    onSuccess: async () => {
      queryClient.removeQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["audit"] });
      toast.success("Items restocked. Audit log updated by system trigger.");
      onClose();
      setRows([{ store_id: storeId ?? 1, product_id: 0, quantity: 0 }]);
    },
    onError: () => toast.error("Restock failed."),
  });

  const addRow = () =>
    setRows((prev) => [...prev, { store_id: storeId ?? 1, product_id: 0, quantity: 0 }]);

  const removeRow = (index: number) =>
    setRows((prev) => prev.filter((_, i) => i !== index));

  const updateRow = (index: number, field: keyof RestockRow, value: number) =>
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );

  const handleSubmit = () => {
    const invalid = rows.some(
      (r) => r.product_id <= 0 || r.quantity <= 0 || r.store_id <= 0
    );
    if (invalid) {
      toast.error("Fill in all fields with valid values.");
      return;
    }
    restockMutation.mutate(rows);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Restock Items</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2 max-h-80 overflow-y-auto pr-1">
          {/* Column headers */}
          <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-slate-500 px-1">
            {isAdmin && <span className="col-span-3">Store ID</span>}
            <span className={isAdmin ? "col-span-4" : "col-span-6"}>Product ID</span>
            <span className="col-span-4">Add Qty</span>
            <span className="col-span-1"></span>
          </div>

          {rows.map((row, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-center">
              {isAdmin && (
                <Input
                  type="number"
                  min={1}
                  value={row.store_id || ""}
                  onChange={(e) => updateRow(index, "store_id", parseInt(e.target.value))}
                  placeholder="Store ID"
                  className="col-span-3 bg-white text-sm h-9"
                />
              )}
              <Input
                type="number"
                min={1}
                value={row.product_id || ""}
                onChange={(e) => updateRow(index, "product_id", parseInt(e.target.value))}
                placeholder="Product ID"
                className={`${isAdmin ? "col-span-4" : "col-span-6"} bg-white text-sm h-9`}
              />
              <Input
                type="number"
                min={1}
                value={row.quantity || ""}
                onChange={(e) => updateRow(index, "quantity", parseInt(e.target.value))}
                placeholder="Qty"
                className="col-span-4 bg-white text-sm h-9"
              />
              <Button
                variant="ghost"
                size="sm"
                className="col-span-1 text-red-500 hover:text-red-700 p-1"
                onClick={() => removeRow(index)}
                disabled={rows.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <Button
            variant="outline"
            size="sm"
            className="w-full border-dashed"
            onClick={addRow}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Another Item
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleSubmit}
            disabled={restockMutation.isPending}
          >
            {restockMutation.isPending ? "Restocking..." : `Restock ${rows.length} Item(s)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}