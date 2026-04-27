import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Brain, FileText, X } from "lucide-react";
import { useState } from "react";
import { useParams } from "next/navigation";

export default function QuestionBankGenerateSheet() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const params = useParams();
  const courseId = params?.courseId as string;

  const MAX_FILE_SIZE = 7 * 1024 * 1024; // 7 MB in bytes

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFileError(null);

    if (file && file.size > MAX_FILE_SIZE) {
      setFileError("File size must be less than 7 MB");
      e.target.value = ""; // Clear the input
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleSubmit = () => {
    console.log("Course ID:", courseId);
    console.log("Selected file:", selectedFile?.name);
    // Add your submission logic here
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="default" className="gap-2">
          <Brain /> Generate Question Bank
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Generate Question Bank</SheetTitle>
          <SheetDescription>
            Use the button below to upload an OpenStax textbook PDF file from
            your computer.
          </SheetDescription>
        </SheetHeader>
        <div className="px-4 grid gap-6">
          <div className="grid gap-3">
            <Field>
              <FieldLabel htmlFor="textbookFile">Textbook PDF File</FieldLabel>
              <Input
                id="textbookFile"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
              />
              <FieldDescription>
                {fileError ? (
                  <span className="text-destructive">{fileError}</span>
                ) : (
                  <span>
                    Max file size is 7 MB. Only .pdf files are supported.
                  </span>
                )}
              </FieldDescription>
            </Field>
            {selectedFile && (
              <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium wrap-break-word">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    setSelectedFile(null);
                    setFileError(null);
                    const input = document.getElementById(
                      "textbookFile",
                    ) as HTMLInputElement;
                    if (input) input.value = "";
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          <div>
            <span className="text-sm">
              Note: This process can take between 5-7 minutes and will run in
              the background.
            </span>
          </div>
        </div>
        <SheetFooter className="flex flex-row flex-wrap justify-end">
          <SheetClose asChild>
            <Button variant="secondary" className="px-6">
              Cancel
            </Button>
          </SheetClose>
          <SheetClose asChild>
            <Button
              variant="default"
              type="submit"
              className="px-6"
              onClick={handleSubmit}
            >
              Submit
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
