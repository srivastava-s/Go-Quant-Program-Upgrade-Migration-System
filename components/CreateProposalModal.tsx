
import React, { useState } from 'react';

interface CreateProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newBuffer: string, description: string) => Promise<void>;
  isLoading: boolean;
}

export const CreateProposalModal: React.FC<CreateProposalModalProps> = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const [newBuffer, setNewBuffer] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBuffer || !description) return;
    await onSubmit(newBuffer, description);
    setNewBuffer('');
    setDescription('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg border border-gray-700/50" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white">Create New Upgrade Proposal</h2>
            <p className="text-sm text-gray-400 mt-1">Submit a new program upgrade for multisig approval.</p>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="new-buffer" className="block text-sm font-medium text-gray-300 mb-1">New Program Buffer Address</label>
              <input
                id="new-buffer"
                type="text"
                value={newBuffer}
                onChange={(e) => setNewBuffer(e.target.value)}
                placeholder="buff..."
                className="w-full bg-gray-900/50 border border-gray-600 rounded-md px-3 py-2 text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition font-mono text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Description</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., v1.3.0: Introduce new features and security enhancements."
                rows={4}
                className="w-full bg-gray-900/50 border border-gray-600 rounded-md px-3 py-2 text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-sm"
                required
              />
            </div>
          </div>
          <div className="p-6 bg-gray-900/50 rounded-b-xl flex items-center justify-end space-x-3">
            {isLoading && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-100"></div>}
            <button type="button" onClick={onClose} disabled={isLoading} className="px-4 py-2 bg-gray-600 text-gray-200 rounded-md hover:bg-gray-500 transition-colors font-semibold text-sm disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 transition-colors font-semibold text-sm disabled:bg-gray-600">Submit Proposal</button>
          </div>
        </form>
      </div>
    </div>
  );
};
