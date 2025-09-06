import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, FileText, Calendar, BarChart3, Eye, Database, FolderOpen, CheckCircle2 } from 'lucide-react';
import { Document } from '../types';
import { useApi } from '../hooks/useApi';
import UserProfile from '../components/UserProfile';

interface TestCase {
  id: string;
  filename: string;
  originalName: string;
  jsonFile: string;
  pdfFile?: string;
  aiOutput: any;
  lastModified: string;
}

export const DocumentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { authenticatedRequest } = useApi();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanningTestCases, setScanningTestCases] = useState(false);
  const [loadingTestCase, setLoadingTestCase] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchDocuments(), scanTestCases()]);
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await authenticatedRequest('/api/documents');
      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const scanTestCases = async () => {
    setScanningTestCases(true);
    try {
      const response = await authenticatedRequest('/api/testcases/scan');
      const data = await response.json();
      setTestCases(data);
    } catch (error) {
      console.error('Error scanning test cases:', error);
    } finally {
      setScanningTestCases(false);
    }
  };

  const handleLoadTestCase = async (testCaseId: string) => {
    setLoadingTestCase(testCaseId);
    try {
      const response = await authenticatedRequest(`/api/testcases/load/${testCaseId}`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to load test case');

      const document = await response.json();
      
      // Update documents list
      setDocuments(prev => {
        const existing = prev.find(doc => doc.id === document.id);
        if (existing) {
          return prev.map(doc => doc.id === document.id ? document : doc);
        }
        return [document, ...prev];
      });

      // Navigate to evaluation page
      navigate(`/evaluate/${document.id}`);
      
    } catch (error) {
      console.error('Error loading test case:', error);
      alert('Failed to load test case. Please try again.');
    } finally {
      setLoadingTestCase(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                <Database className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  AI Output Evaluator
                </h1>
                <p className="mt-1 text-gray-600">
                  Load test cases from local folder and evaluate AI-extracted data accuracy
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <BarChart3 className="w-5 h-5" />
                <span className="font-medium">Dashboard</span>
              </button>
              <UserProfile />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Test Cases Section */}
        <div className="mb-12">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-8 shadow-xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Available Test Cases</h2>
                <p className="text-gray-600 flex items-center">
                  <FolderOpen className="w-4 h-4 mr-2" />
                  Load test cases from the local folder (simulating Azure Blob Storage)
                </p>
              </div>
              <button
                onClick={scanTestCases}
                disabled={scanningTestCases}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:-translate-y-0.5 ${
                  scanningTestCases
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed shadow-sm'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 shadow-lg hover:shadow-xl'
                }`}
              >
                <RefreshCw className={`w-5 h-5 ${scanningTestCases ? 'animate-spin' : ''}`} />
                <span>{scanningTestCases ? 'Scanning...' : 'Refresh Cases'}</span>
              </button>
            </div>

            {testCases.length === 0 ? (
              <div className="border-2 border-dashed border-indigo-200 rounded-2xl p-12 text-center bg-gradient-to-br from-indigo-50 to-purple-50">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <FolderOpen className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">No Test Cases Found</h3>
                <p className="text-gray-600 mb-4">
                  Place JSON files in the <code className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-lg font-mono text-sm">server/test-data</code> folder
                </p>
                <div className="text-sm text-gray-500">
                  Files will be automatically detected when you refresh
                </div>
              </div>
            ) : (
              <div className="bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200/50 max-h-96 overflow-y-auto">
                <div className="divide-y divide-gray-200/50">
                  {testCases.map((testCase) => (
                    <div 
                      key={testCase.id} 
                      className="group relative flex items-center justify-between p-4 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-200"
                    >
                      <div className="flex items-center space-x-4 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-200 flex-shrink-0">
                          <Database className="w-5 h-5 text-white" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-1">
                            <h3 className="text-base font-semibold text-gray-900 truncate group-hover:text-indigo-700 transition-colors" title={testCase.originalName}>
                              {testCase.filename}
                            </h3>
                            <div className={`px-2 py-1 rounded-md text-xs font-medium flex-shrink-0 ${
                              testCase.pdfFile 
                                ? 'bg-green-100 text-green-800 border border-green-200' 
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}>
                              {testCase.pdfFile ? 'PDF + JSON' : 'JSON only'}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></div>
                              <span className="font-medium">
                                {testCase.aiOutput.documentType?.replace('_', ' ').toUpperCase() || 'Unknown Type'}
                              </span>
                            </div>
                            
                            <div className="flex items-center text-gray-500">
                              <Calendar className="w-4 h-4 mr-1" />
                              {new Date(testCase.lastModified).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </div>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleLoadTestCase(testCase.id)}
                        disabled={loadingTestCase === testCase.id}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 flex-shrink-0 ml-4 ${
                          loadingTestCase === testCase.id
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-md hover:shadow-lg transform hover:scale-105'
                        }`}
                      >
                        {loadingTestCase === testCase.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                            <span className="hidden sm:inline">Loading...</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4" />
                            <span className="hidden sm:inline">Load & Evaluate</span>
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Loaded Documents */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-8 shadow-xl">
          <div className="flex items-center mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Loaded Documents</h2>
              <p className="text-gray-600">Documents ready for evaluation</p>
            </div>
          </div>
          
          {documents.length === 0 ? (
            <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border-2 border-dashed border-gray-200">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">No Documents Loaded</h3>
              <p className="text-gray-600 mb-2">Load a test case from above to get started</p>
              <div className="text-sm text-gray-500">Documents will appear here after loading</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents.map((document) => (
                <div 
                  key={document.id} 
                  className="group relative bg-white rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 to-blue-50 opacity-50"></div>
                  <div className="relative p-6">
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex items-center space-x-2">
                        {document.isSubmitted ? (
                          <div className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs font-medium border border-green-200 flex items-center space-x-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Submitted</span>
                          </div>
                        ) : (
                          <div className="px-2 py-1 bg-amber-100 text-amber-800 rounded-md text-xs font-medium border border-amber-200">
                            Pending
                          </div>
                        )}
                        <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium border border-blue-200">
                          #{document.id.slice(-6)}
                        </div>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors truncate" title={document.originalName}>
                      {document.originalName}
                    </h3>
                    
                    <div className="flex items-center text-sm text-gray-500 mb-6">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(document.uploadedAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>

                    <button
                      onClick={() => navigate(`/evaluate/${document.id}`)}
                      className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    >
                      <Eye className="w-5 h-5" />
                      <span>Evaluate Document</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};