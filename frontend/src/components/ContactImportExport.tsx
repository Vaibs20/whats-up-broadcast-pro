
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Upload, Download } from 'lucide-react';
import { Contact } from '@/hooks/useContacts';

interface ContactImportExportProps {
  contacts: Contact[];
  onImport: (contacts: any[]) => void;
  isImporting?: boolean;
}

export function ContactImportExport({ contacts, onImport, isImporting }: ContactImportExportProps) {
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exportToCSV = () => {
    const headers = ['Name', 'Phone', 'Email', 'Status', 'Tags'];
    const csvContent = [
      headers.join(','),
      ...contacts.map(contact => [
        `"${contact.name}"`,
        `"${contact.phone}"`,
        `"${contact.email || ''}"`,
        `"${contact.status}"`,
        `"${contact.tags.join(';')}"`,
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `contacts_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim().toLowerCase());
    const contacts = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
      if (values.length < 2) continue;

      const contact: any = {};
      
      headers.forEach((header, index) => {
        const value = values[index] || '';
        switch (header) {
          case 'name':
            contact.name = value;
            break;
          case 'phone':
            contact.phone = value;
            break;
          case 'email':
            if (value) contact.email = value;
            break;
          case 'status':
            contact.status = ['active', 'inactive', 'blocked'].includes(value) ? value : 'active';
            break;
          case 'tags':
            contact.tags = value ? value.split(';').map((t: string) => t.trim()).filter(Boolean) : [];
            break;
        }
      });

      if (contact.name && contact.phone) {
        contacts.push(contact);
      }
    }

    return contacts;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsedContacts = parseCSV(text);
        
        if (parsedContacts.length === 0) {
          alert('No valid contacts found in the CSV file');
          return;
        }

        onImport(parsedContacts);
        setImportDialogOpen(false);
      } catch (error) {
        alert('Error parsing CSV file. Please check the format.');
      }
    };
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const template = 'Name,Phone,Email,Status,Tags\n"John Doe","+1234567890","john@example.com","active","customer;vip"\n"Jane Smith","+1234567891","jane@example.com","active","lead"';
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'contacts_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex gap-2">
      <Button onClick={exportToCSV} variant="outline">
        <Download className="w-4 h-4 mr-2" />
        Export CSV
      </Button>
      
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Import Contacts from CSV</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              <p>Upload a CSV file with the following columns:</p>
              <ul className="list-disc list-inside mt-2">
                <li>Name (required)</li>
                <li>Phone (required)</li>
                <li>Email (optional)</li>
                <li>Status (active/inactive/blocked)</li>
                <li>Tags (semicolon separated)</li>
              </ul>
            </div>
            
            <Button onClick={downloadTemplate} variant="outline" className="w-full">
              Download Template
            </Button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            
            <Button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="w-full"
            >
              {isImporting ? 'Importing...' : 'Select CSV File'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
