


"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import * as XLSX from "sheetjs-style";

interface ImportStatus {
  success: boolean;
  message: string;
  count?: number;
  invalidEntries?: string[];
  existingEmails?: string[];
  duplicateEmails?: string[];
  duplicateCount?: number;
}

interface ImportCSVBTNProps {
  newsletterOwnerId: string;
  onImportComplete: (status: ImportStatus) => void;
}

const ImportCSVBTN = ({
  newsletterOwnerId,
  onImportComplete,
}: ImportCSVBTNProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!newsletterOwnerId) {
      toast.error("Newsletter owner ID is required.");
      return;
    }

    setIsLoading(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as Record<string, any>[];

      const { validSubscribers, invalidEntries } = jsonData.reduce(
        (acc, row, index) => {
          const email = (row["Email"] || row["email"] || "").toString().trim();
          const name = (row["Name"] || row["name"] || "").toString().trim() || null;
          const status = (row["Status"] || row["status"] || "Subscribed").toString();

          if (!email || !validateEmail(email)) {
            acc.invalidEntries.push(email || `Row ${index + 1}`);
            return acc;
          }

          acc.validSubscribers.push({
            email,
            name,
            status: status === "Unsubscribed" ? "Unsubscribed" : "Subscribed",
            source: (row["Source"] || row["source"] || "CSV Import").toString(),
            pageUrl: (row["Page URL"] || row["pageUrl"] || null)?.toString(),
            newsLetterOwnerId: newsletterOwnerId,
        
          });

          return acc;
        },
        { validSubscribers: [] as any[], invalidEntries: [] as string[] }
      );

      if (validSubscribers.length === 0) {
        toast.error("No valid subscribers found in file.");
        return;
      }

      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscribers: validSubscribers }),
      });

      const result = await res.json();

      const status: ImportStatus = {
        success: result.success ?? false,
        message: result.message || "Unknown status",
        count: result.count ?? 0,
        duplicateEmails: result.duplicateEmails || [],
        existingEmails: result.existingEmails || [],
        invalidEntries: [...invalidEntries, ...(result.invalidEntries || [])],
        duplicateCount: result.duplicateCount ?? 0,
      };

      if (!status.success) toast.error(status.message);
      else toast.success(status.message);

      onImportComplete(status);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to import subscribers";
      toast.error(message);

      onImportComplete({
        success: false,
        message,
        invalidEntries: [],
        duplicateEmails: [],
        existingEmails: [],
      });
    } finally {
      setIsLoading(false);
      e.target.value = ""; // Reset file input
    }
  };

  return (
    <div className="relative">
      <Button variant="default" className="w-full" disabled={isLoading}>
        {isLoading ? "Processing..." : "Import "}
      </Button>
      <input
        type="file"
        accept=".csv,.xlsx,.xls"
        onChange={handleFileUpload}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={isLoading}
      />
    </div>
  );
};

export default ImportCSVBTN;
