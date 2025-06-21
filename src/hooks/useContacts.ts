
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contactApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

export interface Contact {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  tags: string[];
  status: 'active' | 'inactive' | 'blocked';
  metadata?: Record<string, string>;
  lastMessageAt?: Date;
  optedOut: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const useContacts = (params?: any) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: contactsData, isLoading, error } = useQuery({
    queryKey: ['contacts', params],
    queryFn: () => contactApi.getAll(params),
  });

  const createMutation = useMutation({
    mutationFn: contactApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast({
        title: 'Success',
        description: 'Contact created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to create contact',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => contactApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast({
        title: 'Success',
        description: 'Contact updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to update contact',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: contactApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast({
        title: 'Success',
        description: 'Contact deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete contact',
        variant: 'destructive',
      });
    },
  });

  const bulkImportMutation = useMutation({
    mutationFn: contactApi.bulkImport,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast({
        title: 'Import Complete',
        description: `Imported ${response.data.imported} contacts, skipped ${response.data.skipped}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Import Failed',
        description: error.response?.data?.error || 'Failed to import contacts',
        variant: 'destructive',
      });
    },
  });

  return {
    contacts: contactsData?.data?.contacts || [],
    totalPages: contactsData?.data?.totalPages || 0,
    currentPage: contactsData?.data?.currentPage || 1,
    total: contactsData?.data?.total || 0,
    isLoading,
    error,
    createContact: createMutation.mutate,
    updateContact: updateMutation.mutate,
    deleteContact: deleteMutation.mutate,
    bulkImport: bulkImportMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isImporting: bulkImportMutation.isPending,
  };
};
