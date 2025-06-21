
import { useState } from 'react';
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  MoreHorizontal,
  Mail,
  Phone,
  Edit,
  Delete
} from "lucide-react";
import { useContacts, Contact } from '@/hooks/useContacts';
import { ContactForm } from '@/components/ContactForm';
import { ContactImportExport } from '@/components/ContactImportExport';

export default function Contacts() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const queryParams = {
    page,
    limit: 20,
    ...(search && { search }),
    ...(statusFilter && { status: statusFilter }),
    ...(tagFilter && { tags: tagFilter }),
  };

  const {
    contacts,
    totalPages,
    currentPage,
    total,
    isLoading,
    createContact,
    updateContact,
    deleteContact,
    bulkImport,
    isCreating,
    isUpdating,
    isDeleting,
    isImporting,
  } = useContacts(queryParams);

  const handleFormSubmit = (data: any) => {
    if (selectedContact) {
      updateContact({ id: selectedContact._id, data });
    } else {
      createContact(data);
    }
    setFormOpen(false);
    setSelectedContact(null);
  };

  const handleEdit = (contact: Contact) => {
    setSelectedContact(contact);
    setFormOpen(true);
  };

  const handleDelete = (contactId: string) => {
    deleteContact(contactId);
  };

  const handleAddNew = () => {
    setSelectedContact(null);
    setFormOpen(true);
  };

  // Get unique tags from all contacts for filter
  const allTags: string[] = Array.from(new Set(contacts.flatMap(c => c.tags)));

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
            <p className="text-gray-600">Manage your WhatsApp Business contacts ({total} total)</p>
          </div>
          <div className="flex gap-2">
            <ContactImportExport 
              contacts={contacts}
              onImport={bulkImport}
              isImporting={isImporting}
            />
            <Button onClick={handleAddNew} className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Contact
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                All Contacts
              </CardTitle>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input 
                    placeholder="Search contacts..." 
                    className="pl-10 w-64"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={tagFilter} onValueChange={setTagFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Tags" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tags</SelectItem>
                    {allTags.map((tag: string) => (
                      <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading contacts...</div>
            ) : contacts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No contacts found. Add your first contact to get started.
              </div>
            ) : (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contact</TableHead>
                      <TableHead>Phone & Email</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contacts.map((contact) => (
                      <TableRow key={contact._id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <Users className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <h4 className="font-medium">{contact.name}</h4>
                              <p className="text-sm text-gray-500">
                                Created {new Date(contact.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="w-3 h-3" />
                              {contact.phone}
                            </div>
                            {contact.email && (
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <Mail className="w-3 h-3" />
                                {contact.email}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {contact.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={contact.status === 'active' ? 'default' : 'secondary'}>
                            {contact.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleEdit(contact)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Delete className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Contact</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete {contact.name}? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDelete(contact._id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-4">
                    <Button 
                      variant="outline" 
                      disabled={currentPage === 1}
                      onClick={() => setPage(currentPage - 1)}
                    >
                      Previous
                    </Button>
                    <span className="flex items-center px-4">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button 
                      variant="outline" 
                      disabled={currentPage === totalPages}
                      onClick={() => setPage(currentPage + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <ContactForm
          open={formOpen}
          onOpenChange={setFormOpen}
          contact={selectedContact}
          onSubmit={handleFormSubmit}
          isLoading={isCreating || isUpdating}
        />
      </div>
    </Layout>
  );
}
