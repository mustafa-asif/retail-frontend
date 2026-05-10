import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function StoreCreateModal({ open, onClose }: Props) {
  const [form, setForm] = useState({
    store_name: "",
    location: "",
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => api.stores.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
      toast.success("Store created successfully.");
      onClose();
      setForm({ store_name: "", location: "" });
    },
    onError: () => toast.error("Failed to create store."),
  });

  const handleSubmit = () => {
    if (!form.store_name || !form.location) {
      toast.error("Both store name and location are required.");
      return;
    }
    createMutation.mutate(form);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Store</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Store Name</Label>
            <Input
              value={form.store_name}
              onChange={(e) => setForm((p) => ({ ...p, store_name: e.target.value }))}
              placeholder="e.g. Save-Clifton"
              className="bg-white"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Location</Label>
            <Input
              value={form.location}
              onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
              placeholder="e.g. Clifton, Karachi"
              className="bg-white"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleSubmit}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? "Creating..." : "Create Store"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}