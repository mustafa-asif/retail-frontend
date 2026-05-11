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
}

export function CreateCustomerModal({ open, onClose }: Props) {
  const [form, setForm] = useState({
    customer_name: "",
    email: "",
    phone: "",
    city: "",
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => api.customers.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer created successfully.");
      onClose();
      setForm({ customer_name: "", email: "", phone: "", city: "" });
    },
    onError: () => toast.error("Failed to create customer."),
  });

  const handleSubmit = () => {
    if (!form.customer_name) {
      toast.error("Customer name is required.");
      return;
    }
    createMutation.mutate(form);
  };

  const handleChange = (field: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => setForm((p) => ({ ...p, [field]: e.target.value }));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Customer</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Customer Name <span className="text-red-500">*</span></Label>
            <Input
              value={form.customer_name}
              onChange={handleChange("customer_name")}
              placeholder="e.g. Ahmed Khan"
              className="bg-white"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input
              type="email"
              value={form.email}
              onChange={handleChange("email")}
              placeholder="e.g. ahmed@gmail.com"
              className="bg-white"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input
              value={form.phone}
              onChange={handleChange("phone")}
              placeholder="e.g. 0300-1234567"
              className="bg-white"
            />
          </div>
          <div className="space-y-1.5">
            <Label>City</Label>
            <Input
              value={form.city}
              onChange={handleChange("city")}
              placeholder="e.g. Karachi"
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
            {createMutation.isPending ? "Creating..." : "Create Customer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}