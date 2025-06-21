
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import { Contact } from '@/hooks/useContacts';

interface ContactFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact?: Contact | null;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export function ContactForm({ open, onOpenChange, contact, onSubmit, isLoading }: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    status: 'active' as 'active' | 'inactive' | 'blocked',
    tags: [] as string[],
  });
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (contact) {
      setFormData({
        name: contact.name,
        phone: contact.phone,
        email: contact.email || '',
        status: contact.status,
        tags: contact.tags,
      });
    } else {
      setFormData({
        name: '',
        phone: '',
        email: '',
        status: 'active',
        tags: [],
      });
    }
  }, [contact, open]);

  const formatPhoneNumber = (phone: string) => {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');
    
    // Add + prefix if not present and format for international
    if (digits.length >= 10) {
      if (!digits.startsWith('1') && digits.length === 10) {
        return `+1${digits}`;
      }
      return `+${digits}`;
    }
    return phone;
  };

  const validatePhone = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 10;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePhone(formData.phone)) {
      return;
    }

    const formattedPhone = formatPhoneNumber(formData.phone);
    
    onSubmit({
      ...formData,
      phone: formattedPhone,
      email: formData.email || undefined,
    });
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{contact ? 'Edit Contact' : 'Add New Contact'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="+1234567890"
              required
            />
            {formData.phone && !validatePhone(formData.phone) && (
              <p className="text-sm text-red-500 mt-1">Please enter a valid phone number</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>
          
          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Tags</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} variant="outline">Add</Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {formData.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="cursor-pointer">
                  {tag}
                  <X 
                    className="w-3 h-3 ml-1" 
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : (contact ? 'Update' : 'Create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
