import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, FileText, Calendar, Database, Lock, CheckCircle2 } from 'lucide-react';
import { PDFViewer } from '../components/PDFViewer';
import { JSONEditor } from '../components/JSONEditor';
import { Document, Feedback, FieldValidation } from '../types';
import { API_BASE_URL, apiFetch } from '../config/api';

export const EvaluationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [document, setDocument] = useState<Document | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [feedbackMap, setFeedbackMap] = useState<Record<string, FieldValidation>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchDocument();
    }
  }, [id]);

  useEffect(() => {
    const map: Record<string, FieldValidation> = {};
    feedbacks.forEach(feedback => {
      map[feedback.fieldPath] = {
        fieldPath: feedback.fieldPath,
        fieldName: feedback.fieldName,
        aiValue: feedback.aiValue,
        isCorrect: feedback.isCorrect,
        correctValue: feedback.correctValue,
        confidence: feedback.confidence,
        comment: feedback.comment,
      };
    });
    setFeedbackMap(map);
  }, [feedbacks]);

  const fetchDocument = async () => {
    try {
      const response = await apiFetch(`/api/documents/${id}`);
      if (!response.ok) throw new Error('Failed to fetch document');
      
      const data = await response.json();
      setDocument(data);
      setFeedbacks(data.feedbacks || []);
    } catch (error) {
      console.error('Error fetching document:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldFeedback = async (feedback: FieldValidation) => {
    if (!document || document.isSubmitted) return;

    setSaving(true);
    try {
      const response = await apiFetch('/api/feedback', {
        method: 'POST',
        body: JSON.stringify({
          documentId: document.id,
          ...feedback,
        }),
      });

      if (!response.ok) throw new Error('Failed to submit feedback');

      const newFeedback = await response.json();
      
      setFeedbacks(prev => {
        const existing = prev.find(f => f.fieldPath === feedback.fieldPath);
        if (existing) {
          return prev.map(f => f.fieldPath === feedback.fieldPath ? newFeedback : f);
        }
        return [...prev, newFeedback];
      });

    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitDocument = async () => {
    if (!document || document.isSubmitted) return;

    const confirmed = window.confirm(
      'Are you sure you want to submit this test case? Once submitted, you will not be able to make any further changes.'
    );

    if (!confirmed) return;

    setSubmitting(true);
    try {
      const response = await apiFetch(`/api/documents/${document.id}/submit`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to submit document');

      const updatedDocument = await response.json();
      setDocument(updatedDocument);
      
      // Show success message
      alert('Test case submitted successfully! The document is now locked and cannot be modified.');

    } catch (error) {
      console.error('Error submitting document:', error);
      alert('Failed to submit test case. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <div className="text-gray-600">Document not found</div>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Documents
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-50 shadow-lg">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => navigate('/')}
                className="p-3 hover:bg-indigo-50 rounded-xl transition-all duration-200 group border border-gray-200 hover:border-indigo-300"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-indigo-600 transition-colors" />
              </button>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{document.originalName}</h1>
                  <div className="text-sm text-gray-600 flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Uploaded {new Date(document.uploadedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">

              {document?.isSubmitted ? (
                <div className="flex items-center space-x-2 bg-green-50 text-green-700 px-4 py-3 rounded-xl border border-green-200 shadow-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <div className="text-sm">
                    <div className="font-medium">Submitted & Locked</div>
                    <div className="text-xs text-green-600">
                      {document.submittedAt && new Date(document.submittedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleSubmitDocument}
                  disabled={submitting}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg ${
                    submitting
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-700 hover:to-green-700 hover:shadow-xl transform hover:-translate-y-0.5'
                  }`}
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      <span>Submit & Lock</span>
                    </>
                  )}
                </button>
              )}

              {saving && (
                <div className="flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl border border-blue-200">
                  <Save className="w-4 h-4 animate-pulse" />
                  <span className="text-sm font-medium">Saving...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 h-[calc(100vh-120px)]">
          {/* PDF Viewer */}
          <div className="bg-white/70 backdrop-blur-sm border-r border-gray-200/50 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-gray-100 px-4 py-2 border-b border-gray-200/50">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center shadow-md">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900">Source Document</h2>
                  <p className="text-xs text-gray-600">Original PDF</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-slate-100"></div>
              <PDFViewer
                file={`${API_BASE_URL}${document.filePath}`}
                className="relative h-[calc(100vh-180px)] bg-transparent"
              />
            </div>
          </div>

          {/* JSON Editor */}
          <div className="bg-white/70 backdrop-blur-sm overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-100 px-4 py-2 border-b border-gray-200/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-lg flex items-center justify-center shadow-md">
                    <Database className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">AI Extracted Data</h2>
                    <p className="text-xs text-gray-600">Click to mark incorrect</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-700 font-medium">Correct</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-red-700 font-medium">Incorrect</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="text-gray-600 font-medium">Unvalidated</span>
                  </div>
                </div>
              </div>
            </div>
            <div className={`h-[calc(100vh-180px)] overflow-auto bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/30 ${document.isSubmitted ? 'relative' : ''}`}>
              {document.isSubmitted && (
                <div className="absolute inset-0 bg-gray-900/10 backdrop-blur-[1px] z-10 flex items-center justify-center">
                  <div className="bg-white/90 backdrop-blur-md rounded-xl p-6 border border-gray-200/50 shadow-xl">
                    <div className="flex items-center space-x-3 text-gray-700">
                      <Lock className="w-6 h-6" />
                      <div>
                        <div className="font-semibold">Document Locked</div>
                        <div className="text-sm text-gray-600">This test case has been submitted and cannot be modified</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <JSONEditor
                data={document.aiOutput}
                onFieldFeedback={handleFieldFeedback}
                existingFeedback={feedbackMap}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

