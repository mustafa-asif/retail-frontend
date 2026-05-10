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
import { Label } from "@/components/ui/label";

interface Props {
  open: boolean;
  onClose: () => void;
  storeId: number | null;
  isAdmin: boolean;
}

export function CreateModal({ open, onClose, storeId, isAdmin }: Props) {
  const [form, setForm] = useState({
    store_id: storeId ?? 1,
    product_id: 0,
    quantity: 0,
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => api.inventory.create(data),
    onSuccess: async () => {
      await api.inventory.refreshMaterializedView();
      queryClient.removeQueries({ queryKey: ["inventory"] });
      toast.success("Inventory item created successfully.");
      onClose();
      setForm({ store_id: storeId ?? 1, product_id: 0, quantity: 0 });
    },
    onError: () => toast.error("Failed to create inventory item."),
  });

  const handleSubmit = () => {
    if (form.product_id <= 0 || form.quantity <= 0 || form.store_id <= 0) {
      toast.error("Fill in all fields with valid values.");
      return;
    }
    createMutation.mutate(form);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Inventory Item</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {isAdmin && (
            <div className="space-y-1.5">
              <Label>Store ID</Label>
              <Input
                type="number"
                min={1}
                value={form.store_id || ""}
                onChange={(e) => setForm((p) => ({ ...p, store_id: parseInt(e.target.value) }))}
                placeholder="Enter store ID"
                className="bg-white"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Product ID</Label>
            <Input
              type="number"
              min={1}
              value={form.product_id || ""}
              onChange={(e) => setForm((p) => ({ ...p, product_id: parseInt(e.target.value) }))}
              placeholder="Enter product ID"
              className="bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Initial Quantity</Label>
            <Input
              type="number"
              min={1}
              value={form.quantity || ""}
              onChange={(e) => setForm((p) => ({ ...p, quantity: parseInt(e.target.value) }))}
              placeholder="Enter quantity"
              className="bg-white"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleSubmit}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? "Creating..." : "Create Item"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}