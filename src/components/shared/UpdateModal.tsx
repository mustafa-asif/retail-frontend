import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (value: string) => void;
  isPending?: boolean;
  title?: string;
  fields?: {
    label: string;
    value: string;
    display?: boolean; // read-only info row
  }[];
  inputLabel?: string;
  inputValue: string;
  onInputChange: (val: string) => void;
  inputType?: string;
  inputMin?: number;
}

export function UpdateModal({
  open,
  onClose,
  onSubmit,
  isPending,
  title = "Update",
  fields = [],
  inputLabel = "New Value",
  inputValue,
  onInputChange,
  inputType = "number",
  inputMin = 0,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Read-only info rows */}
          {fields.map((field) => (
            <div key={field.label} className="flex justify-between text-sm">
              <span className="text-slate-500">{field.label}</span>
              <span className="font-medium text-slate-900">{field.value}</span>
            </div>
          ))}

          {/* Editable input */}
          <div className="space-y-1.5">
            <Label>{inputLabel}</Label>
            <Input
              type={inputType}
              min={inputMin}
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder={`Enter ${inputLabel.toLowerCase()}`}
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
            onClick={() => onSubmit(inputValue)}
            disabled={isPending}
          >
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}