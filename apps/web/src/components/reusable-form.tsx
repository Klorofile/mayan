import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type FormField = {
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
};

export function ReusableForm({
  fields,
  submitLabel = "Save"
}: {
  fields: FormField[];
  submitLabel?: string;
}) {
  return (
    <form className="grid gap-4">
      {fields.map((field) => (
        <div key={field.name} className="space-y-2">
          <Label htmlFor={field.name}>{field.label}</Label>
          <Input id={field.name} name={field.name} type={field.type ?? "text"} placeholder={field.placeholder} />
        </div>
      ))}
      <Button type="button" className="mt-2">
        {submitLabel}
      </Button>
    </form>
  );
}
