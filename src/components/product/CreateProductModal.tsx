
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { api } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryClient } from "@/lib/queryClient";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CreateProductModal({ open, onClose }: Props) {
  const [form, setForm] = useState({
    productName: "",
    category: "",
    price: "",
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => api.products.create({
      product_name: data.productName,
      category: data.category,
      price: parseFloat(data.price),
    }),
    onSuccess: () => {

      toast.success("Product created successfully.");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      onClose();
      setForm({ productName: "", category: "", price: "" });
    },
    onError: () => toast.error("Failed to create product."),
  });

  const handleSubmit = () => {
    if (!form.productName || !form.price) {
      toast.error("Product name and price are required.");
      return;
    }
    createMutation.mutate(form);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Product</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Product Name</Label>
            <Input
              value={form.productName}
              onChange={(e) => setForm((prev) => ({ ...prev, productName: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Input
              value={form.category}
              onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Price</Label>
            <Input
              type="number"
              min={0}
              value={form.price}
              onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={createMutation.isPending}>
            {createMutation.isPending ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}