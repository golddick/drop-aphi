"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Import } from "lucide-react";
import ImportCSVBTN from "./exportCSVBTN";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

interface ImportSubscriberModalProps {
  newsletterOwnerId?: string;
  onImportComplete: () => void;
}

export function ImportSubscriberModal({
  newsletterOwnerId,
  onImportComplete,
}: ImportSubscriberModalProps) {
  const [open, setOpen] = useState(false);
  const [importStatus, setImportStatus] = useState<{
    success: boolean;
    message: string;
    invalidEntries?: string[];
    count?: number;
    duplicateCount?: number;
    duplicateEmails?: string[];
    existingEmails?: string[];
  } | null>(null);

  const resetSelection = () => {
    setImportStatus(null);
  };

  const handleImportComplete = (status: {
    success: boolean;
    message: string;
    invalidEntries?: string[];
    count?: number;
    duplicateCount?: number;
  }) => {
    setImportStatus(status);
    if (status.success) {
      toast.success(status.message);
      onImportComplete();
      setOpen(false);
      resetSelection();
    } else {
      toast.error(status.message);
    }
  };

  if (!newsletterOwnerId) {
    return (
      <Button variant="outline" disabled>
        <Import className="h-4 w-4 mr-2" />
        <span className="hidden md:block">Import CSV/Excel</span>
      </Button>
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) resetSelection();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" className="border-gold-600 text-gold-600 hover:bg-blue-50">
          <Import className="h-4 w-4 mr-2" />
          <span className="hidden md:block">Import CSV/Excel</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Subscribers</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Import Status */}
          {importStatus && (
            <Alert variant={importStatus.success ? "default" : "destructive"}>
              <AlertDescription>
                <div className="font-medium">{importStatus.message}</div>

                {importStatus.duplicateEmails && importStatus.duplicateEmails.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium">Duplicate Emails:</p>
                    <ul className="list-disc pl-5 max-h-40 overflow-y-auto text-sm text-muted-foreground">
                      {importStatus.duplicateEmails.map((email, index) => (
                        <li key={`dup-${index}`}>{email}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {importStatus.existingEmails && importStatus.existingEmails.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium">Already Existing Emails:</p>
                    <ul className="list-disc pl-5 max-h-40 overflow-y-auto text-sm text-muted-foreground">
                      {importStatus.existingEmails.map((email, index) => (
                        <li key={`exist-${index}`}>{email}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {importStatus.invalidEntries && importStatus.invalidEntries.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium">Invalid Entries:</p>
                    <ul className="list-disc pl-5 max-h-40 overflow-y-auto text-sm text-muted-foreground">
                      {importStatus.invalidEntries.map((entry, index) => (
                        <li key={`invalid-${index}`}>{entry}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Direct CSV Import Button */}
          <ImportCSVBTN
            newsletterOwnerId={newsletterOwnerId}
            onImportComplete={handleImportComplete}
          />

          <div className="text-sm text-muted-foreground">
            <p>Import subscribers directly to your newsletter list.</p>
            <p>Supported formats: CSV, Excel</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}