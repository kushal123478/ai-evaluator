import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { FieldValidation } from '../types';

interface JSONEditorProps {
  data: Record<string, any>;
  onFieldFeedback: (feedback: FieldValidation) => void;
  existingFeedback?: Record<string, FieldValidation>;
  className?: string;
}

export const JSONEditor: React.FC<JSONEditorProps> = ({
  data,
  onFieldFeedback,
  existingFeedback = {},
  className = ''
}) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [correctValue, setCorrectValue] = useState<string>('');

  const renderValue = (value: any, path: string, key: string): React.ReactNode => {
    const fieldPath = path ? `${path}.${key}` : key;
    const feedback = existingFeedback[fieldPath];
    const isEditing = editingField === fieldPath;

    const handleMarkCorrect = () => {
      if (typeof value === 'string' || typeof value === 'number') {
        onFieldFeedback({
          fieldPath,
          fieldName: key,
          aiValue: String(value),
          isCorrect: true,
          correctValue: '',
          confidence: 5,
          comment: ''
        });
      }
    };

    const handleMarkIncorrect = () => {
      if (typeof value === 'string' || typeof value === 'number') {
        setEditingField(fieldPath);
        setCorrectValue(feedback?.correctValue || '');
      }
    };

    const handleSubmitCorrection = () => {
      if (correctValue.trim()) {
        onFieldFeedback({
          fieldPath,
          fieldName: key,
          aiValue: String(value),
          isCorrect: false,
          correctValue: correctValue.trim(),
          confidence: 5,
          comment: ''
        });
        setEditingField(null);
        setCorrectValue('');
      }
    };

    const handleCancelEdit = () => {
      setEditingField(null);
      setCorrectValue('');
    };

    if (typeof value === 'object' && value !== null) {
      return (
        <div className="ml-1">
          <div className="flex items-center mb-1">
            <div className="w-1.5 h-1.5 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full mr-1.5"></div>
            <span className="text-xs font-bold text-gray-800 bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </span>
          </div>
          <div className="border-l-2 border-indigo-200 bg-gradient-to-r from-indigo-50/30 to-purple-50/30 rounded-r-lg pl-3 py-1 ml-2">
            {Object.entries(value).map(([k, v]) => (
              <div key={k} className="mb-2 last:mb-1">
                {renderValue(v, fieldPath, k)}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="group relative">
        <div
          className={`p-2 rounded-lg border transition-all duration-200 ${
            feedback
              ? feedback.isCorrect
                ? 'border-emerald-300 bg-gradient-to-r from-emerald-50/50 to-green-50/50'
                : 'border-rose-300 bg-gradient-to-r from-rose-50/50 to-red-50/50'
              : 'border-emerald-300 bg-gradient-to-r from-emerald-50/50 to-green-50/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-0.5">
                <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                </span>
              </div>
              <span className="text-sm text-gray-900 font-medium break-words">{String(value)}</span>
            </div>
            <div className="flex items-center space-x-1 ml-3">
              {feedback ? (
                <div className="flex items-center space-x-1">
                  <button
                    onClick={handleMarkCorrect}
                    className={`p-2 rounded-full transition-all duration-200 ${
                      feedback.isCorrect
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-gray-100 text-gray-400 hover:bg-emerald-50 hover:text-emerald-500'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleMarkIncorrect}
                    className={`p-2 rounded-full transition-all duration-200 ${
                      !feedback.isCorrect
                        ? 'bg-rose-100 text-rose-600'
                        : 'bg-gray-100 text-gray-400 hover:bg-rose-50 hover:text-rose-500'
                    }`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {feedback && !feedback.isCorrect && feedback.correctValue && (
                    <span className="text-xs text-gray-600 ml-2 font-mono bg-gray-100 px-2 py-0.5 rounded">
                      GT: {feedback.correctValue}
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-1">
                  <div className="p-2 rounded-full bg-emerald-100 text-emerald-600">
                    <Check className="w-4 h-4" />
                  </div>
                  <button
                    onClick={handleMarkIncorrect}
                    className="p-2 rounded-full bg-gray-100 text-gray-400 hover:bg-rose-50 hover:text-rose-500 transition-all duration-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="mt-2 p-3 bg-rose-50 rounded-lg border border-rose-200">
            <div className="flex items-center space-x-2">
              <label className="text-xs font-semibold text-rose-800 whitespace-nowrap">
                Correct value:
              </label>
              <input
                type="text"
                value={correctValue}
                onChange={(e) => setCorrectValue(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSubmitCorrection();
                  } else if (e.key === 'Escape') {
                    handleCancelEdit();
                  }
                }}
                className="flex-1 px-2 py-1 border border-rose-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-400 bg-white"
                placeholder="Enter correct value"
                autoFocus
              />
              <button
                onClick={handleSubmitCorrection}
                disabled={!correctValue.trim()}
                className="px-2 py-1 bg-rose-600 text-white rounded text-xs font-medium hover:bg-rose-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200"
              >
                Save
              </button>
              <button
                onClick={handleCancelEdit}
                className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs font-medium hover:bg-gray-300 transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Safety check for data
  if (!data || typeof data !== 'object') {
    return (
      <div className={`p-6 ${className}`}>
        <div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-center">
            <div className="text-gray-500 font-medium">No Data Available</div>
            <div className="text-sm text-gray-400 mt-1">AI output data is missing or invalid</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-3 ${className}`}>
      <div className="space-y-3">
        {Object.entries(data).map(([key, value]) => (
          <div key={key}>
            {renderValue(value, '', key)}
          </div>
        ))}
      </div>
    </div>
  );
};