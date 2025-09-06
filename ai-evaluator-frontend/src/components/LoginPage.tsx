import React from 'react';
import { useAuth } from '../auth/AuthProvider';
import { LogIn, Shield, Users, FileText } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { login, loading } = useAuth();

  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Evaluator</h1>
            <p className="text-gray-600">Secure access with Azure Active Directory</p>
          </div>

          {/* Features */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <Shield className="w-5 h-5 text-green-500" />
              <span>Enterprise-grade security</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <Users className="w-5 h-5 text-blue-500" />
              <span>Single sign-on experience</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <FileText className="w-5 h-5 text-purple-500" />
              <span>Evaluate AI-generated content</span>
            </div>
          </div>

          {/* Login Button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                <span>Sign in with Microsoft</span>
              </>
            )}
          </button>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Protected by Azure Active Directory
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Need access? Contact your administrator</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;