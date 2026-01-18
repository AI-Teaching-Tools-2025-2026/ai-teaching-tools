"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function FormPropsTextFields() {
  return (
    <form className="flex flex-col gap-6 p-4" autoComplete="off">
      <div className="flex flex-wrap gap-4">
        <div className="grid w-[25ch] gap-1.5">
          <Label htmlFor="required-field">
            Required <span className="text-destructive">*</span>
          </Label>
          <Input
            id="required-field"
            required
            defaultValue="Hello World"
          />
        </div>

        <div className="grid w-[25ch] gap-1.5">
          <Label htmlFor="disabled-field">Disabled</Label>
          <Input
            id="disabled-field"
            disabled
            defaultValue="Hello World"
          />
        </div>

        <div className="grid w-[25ch] gap-1.5">
          <Label htmlFor="password-field">Password</Label>
          <Input
            id="password-field"
            type="password"
            autoComplete="current-password"
          />
        </div>

        <div className="grid w-[25ch] gap-1.5">
          <Label htmlFor="readonly-field">Read Only</Label>
          <Input
            id="readonly-field"
            readOnly
            defaultValue="Hello World"
          />
        </div>

        <div className="grid w-[25ch] gap-1.5">
          <Label htmlFor="search-field">Search field</Label>
          <Input
            id="search-field"
            type="search"
          />
        </div>

        <div className="grid w-[25ch] gap-1.5">
          <Label htmlFor="helper-field">Helper text</Label>
          <Input
            id="helper-field"
            defaultValue="Default Value"
          />
          <p className="text-sm text-muted-foreground">Some important text</p>
        </div>
      </div>
    </form>
  );
}
