'use client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const categoryOptions = [
  'Inyama yenhloko',
  'Mogodu',
  'Assorted',
  'Hard Body',
  'Sheep Trotter',
  'Cow Heels',
  'Skopo(Sheep)',
  'PorkTrotters',
];

export function CategoryModal({
  open,
  onClose,
  selected,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  selected: string[];
  onSave: (values: string[]) => void;
}) {
  const [localSelected, setLocalSelected] = useState<string[]>(selected);

  const toggle = (item: string) => {
    setLocalSelected((prev) =>
      prev.includes(item)
        ? prev.filter((i) => i !== item)
        : [...prev, item]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Categories</DialogTitle>
        </DialogHeader>
        <div className="grid gap-2">
          {categoryOptions.map((cat) => (
            <label key={cat} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={localSelected.includes(cat)}
                onChange={() => toggle(cat)}
              />
              <span>{cat}</span>
            </label>
          ))}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => {
              onSave(localSelected);
              onClose();
            }}
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
