import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  FileText, 
  X, 
  AlertCircle, 
  CheckCircle, 
  BookOpen,
  Tag,
  Users,
  User,
  FolderOpen,
  PenTool,
  Sparkles,
  ArrowLeft,
  Loader2,
  FileCheck
} from 'lucide-react';
import { researchAPI } from '../../utils/api';

const SubmitResearch = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const resubmitData = location.state?.resubmit; 

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [categories, setCategories] = useState([]);
  const [facultyMembers, setFacultyMembers] = useState([]);
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const [formData, setFormData] = useState({
    title: resubmitData?.title || '',
    abstract: resubmitData?.abstract || '',
    keywords: resubmitData?.keywords?.join(', ') || '',
    coAuthors: resubmitData?.co_authors || '',
    category: resubmitData?.category || '',
    facultyId: resubmitData?.faculty_id || '',
    department: resubmitData?.department || ''
  });

  useEffect(() => {
    fetchCategories();
    fetchFacultyMembers();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await researchAPI.getCategories();
      setCategories(response.data.categories || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setCategories([]); // Set empty array on error
    }
  };

  const fetchFacultyMembers = async () => {
    try {
      const response = await researchAPI.getFacultyMembers();
      setFacultyMembers(response.data.facultyMembers || []);
    } catch (err) {
      console.error('Failed to fetch faculty members:', err);
      setFacultyMembers([]); // Set empty array on error
    }
  };

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setError('');
      // Simulate upload progress for better UX
      simulateUploadProgress();
    }
  };

  const simulateUploadProgress = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setUploadProgress(0);

    if (!file && !resubmitData) {
      setError('Please upload a PDF file');
      return;
    }

    if (!formData.title || !formData.abstract || !formData.category) {
      setError('Please fill in all required fields');
      return;
    }

    // Make faculty optional for testing - just warn if not selected
    if (!formData.facultyId && !resubmitData) {
      console.warn('No faculty advisor selected - submission will proceed without faculty assignment');
    }

    setLoading(true);
    simulateUploadProgress(); // Start progress simulation

    try {
      const submitData = new FormData();
      
      if (resubmitData?.id) {
        submitData.append('id', resubmitData.id);
      }

      if (file) {
        submitData.append('file', file);
      }
      
      submitData.append('title', formData.title);
      submitData.append('abstract', formData.abstract);
      submitData.append('keywords', formData.keywords);
      submitData.append('coAuthors', formData.coAuthors);
      submitData.append('category', formData.category);
      submitData.append('facultyId', formData.facultyId);
      submitData.append('department', formData.department);

      await researchAPI.submitResearch(submitData);
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/student/my-research');
      }, 2000);
    } catch (err) {
      console.error('Submission error:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to submit research';
      setError(errorMessage);
      console.error('Full error details:', err.response?.data || err);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const removeFile = () => {
    setFile(null);
    setUploadProgress(0);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fadeIn">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate('/student/my-research')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-slate-50 to-white border border-slate-200 text-slate-700 font-semibold hover:from-slate-100 hover:to-white transition-all duration-300 transform hover:-translate-x-1"
          >
            <ArrowLeft size={18} />
            Back to Research
          </button>
        </div>
        
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center shadow-lg">
            <PenTool size={28} className="text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">
              {resubmitData ? 'Resubmit Research' : 'Submit New Research'}
            </h1>
            <p className="text-lg text-slate-600 font-medium">
              {resubmitData 
                ? `Update and improve your research submission`
                : 'Share your academic work with the university community'}
            </p>
            {resubmitData && (
              <div className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-amber-700 text-sm font-semibold">
                <FileCheck size={14} />
                Updating: "{resubmitData.title}"
              </div>
            )}
            {resubmitData?.revision_notes && (
              <div className="mt-4 p-4 rounded-xl bg-orange-50 border border-orange-200">
                <p className="text-sm font-bold text-orange-800 mb-2 flex items-center gap-2">
                  <AlertCircle size={16} />
                  Reviewer's Revision Notes:
                </p>
                <p className="text-sm text-orange-700">{resubmitData.revision_notes}</p>
              </div>
            )}
          </div>
          <div className="hidden md:block">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-700 text-sm font-semibold">
              <Sparkles size={14} />
              Academic Integrity Verified
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 flex items-start gap-4 animate-slideInDown">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
            <CheckCircle size={24} className="text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-green-900 mb-1">Research Submitted Successfully!</h3>
            <p className="text-green-700">
              Your research has been sent for academic review. You'll receive notifications about the review progress.
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm text-green-600">
              <Loader2 size={14} className="animate-spin" />
              Redirecting to your research dashboard...
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-8 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-6 flex items-start gap-4 animate-shake">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center flex-shrink-0">
            <AlertCircle size={24} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-red-900 mb-1">Submission Error</h3>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-gradient-to-br from-white to-slate-50 rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Form Header */}
        <div className="px-8 py-6 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center">
              <BookOpen size={20} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Research Details</h2>
              <p className="text-slate-600 text-sm font-medium">Fill in all required academic information</p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* File Upload Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <FileText size={20} className="text-indigo-600" />
              <label className="block text-lg font-bold text-slate-900">
                Research Paper (PDF) {resubmitData ? '(Optional if keeping current)' : <span className="text-red-500">*</span>}
              </label>
            </div>
            
            {!file ? (
              <div
                {...getRootProps()}
                className={`border-3 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-500 transform hover:scale-[1.01] ${
                  isDragActive
                    ? 'border-indigo-500 bg-gradient-to-r from-indigo-50 to-blue-50 border-solid'
                    : 'border-slate-300 hover:border-indigo-400 hover:bg-gradient-to-r from-slate-50 to-white'
                }`}
              >
                <input {...getInputProps()} />
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center mx-auto mb-6">
                  <Upload size={32} className="text-indigo-600" />
                </div>
                {isDragActive ? (
                  <p className="text-xl font-bold text-indigo-600 mb-2">Drop PDF Here</p>
                ) : (
                  <>
                    <p className="text-lg font-bold text-slate-900 mb-2">
                      {resubmitData 
                        ? 'Drag & drop to replace current PDF'
                        : 'Drag & drop your research PDF here'}
                    </p>
                    <p className="text-slate-600 mb-4">or click to browse files</p>
                  </>
                )}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-slate-100 to-white border border-slate-300 text-slate-700 text-sm font-semibold">
                  <FileText size={14} />
                  PDF files only • Max 10MB
                </div>
              </div>
            ) : (
              <div className="border-2 border-slate-300 rounded-2xl p-6 bg-gradient-to-r from-white to-slate-50 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                      <FileText size={28} className="text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-lg mb-1">{file.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                        <span className="px-2 py-1 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 text-xs font-bold">
                          PDF Format
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="p-2 rounded-xl bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-600 hover:from-red-100 hover:to-pink-100 transition-all duration-300 transform hover:scale-110"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                {/* Upload Progress Bar */}
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-slate-700">Uploading...</span>
                      <span className="font-bold text-indigo-600">{uploadProgress}%</span>
                    </div>
                    <div className="h-2 w-full bg-gradient-to-r from-slate-200 to-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-300 ease-out"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            )}
            {resubmitData && !file && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200">
                <FileText size={16} className="text-amber-600" />
                <p className="text-sm font-medium text-amber-700">
                  Current file: <span className="font-bold">{resubmitData.file_name}</span>
                </p>
              </div>
            )}
          </div>

          {/* Title */}
          <div className="space-y-3">
            <label htmlFor="title" className="block text-lg font-bold text-slate-900">
              Research Title <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-6 py-4 bg-white border-2 border-slate-300 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 font-medium shadow-sm hover:border-slate-400"
                placeholder="Enter your research title"
                required
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <BookOpen size={20} className="text-slate-400" />
              </div>
            </div>
            <p className="text-sm text-slate-500">Make it descriptive and specific to your research</p>
          </div>

          {/* Abstract */}
          <div className="space-y-3">
            <label htmlFor="abstract" className="block text-lg font-bold text-slate-900">
              Abstract <span className="text-red-500">*</span>
            </label>
            <textarea
              id="abstract"
              name="abstract"
              value={formData.abstract}
              onChange={handleChange}
              rows={6}
              className="w-full px-6 py-4 bg-white border-2 border-slate-300 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 font-medium shadow-sm hover:border-slate-400 resize-none"
              placeholder="Provide a comprehensive summary of your research (150-250 words recommended)"
              required
            />
            <div className="flex justify-between items-center">
              <p className="text-sm text-slate-500">Word count: {formData.abstract.split(/\s+/).filter(Boolean).length}</p>
              <p className="text-sm text-slate-500">Recommended: 150-250 words</p>
            </div>
          </div>

          {/* Category */}
          <div className="space-y-3">
            <label htmlFor="category" className="block text-lg font-bold text-slate-900">
              Research Category <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-6 py-4 bg-white border-2 border-slate-300 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 appearance-none font-medium shadow-sm hover:border-slate-400"
                required
              >
                <option value="" className="text-slate-400">Select a research category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id} className="text-slate-900">
                    {cat.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-6 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <FolderOpen size={20} className="text-slate-400" />
              </div>
            </div>
            <p className="text-sm text-slate-500">Choose the most relevant category for your research</p>
          </div>

          {/* Faculty Advisor Selection */}
          <div className="space-y-3">
            <label htmlFor="facultyId" className="block text-lg font-bold text-slate-900">
              Faculty Advisor <span className="text-amber-500 text-sm">(Optional for testing)</span>
            </label>
            <div className="relative">
              <select
                id="facultyId"
                name="facultyId"
                value={formData.facultyId}
                onChange={handleChange}
                className="w-full px-6 py-4 bg-white border-2 border-slate-300 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 appearance-none font-medium shadow-sm hover:border-slate-400"
              >
                <option value="">Select your faculty advisor (optional)</option>
                {facultyMembers && facultyMembers.length > 0 ? (
                  facultyMembers.map((faculty) => (
                    <option key={faculty.id} value={faculty.id} className="text-slate-900">
                      {faculty.full_name} {faculty.department ? `(${faculty.department})` : ''}
                    </option>
                  ))
                ) : (
                  <option value="" disabled className="text-slate-400">No faculty members available</option>
                )}
              </select>
              <div className="absolute right-6 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <User size={20} className="text-slate-400" />
              </div>
            </div>
            {facultyMembers && facultyMembers.length === 0 && (
              <p className="text-sm text-amber-600">
                ⚠️ No faculty members found. You can still submit without a faculty advisor.
              </p>
            )}
            {facultyMembers && facultyMembers.length > 0 && (
              <p className="text-sm text-slate-500">Your faculty advisor will be the first to review your submission</p>
            )}
          </div>

          {/* Department (Optional) */}
          <div className="space-y-3">
            <label htmlFor="department" className="block text-lg font-bold text-slate-900">
              Department (Optional)
            </label>
            <div className="relative">
              <input
                type="text"
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-6 py-4 bg-white border-2 border-slate-300 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 font-medium shadow-sm hover:border-slate-400"
                placeholder="e.g., Computer Science, Engineering"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <FolderOpen size={20} className="text-slate-400" />
              </div>
            </div>
            <p className="text-sm text-slate-500">Specify your academic department if applicable</p>
          </div>

          {/* Keywords */}
          <div className="space-y-3">
            <label htmlFor="keywords" className="block text-lg font-bold text-slate-900">
              Keywords
            </label>
            <div className="relative">
              <input
                type="text"
                id="keywords"
                name="keywords"
                value={formData.keywords}
                onChange={handleChange}
                className="w-full px-6 py-4 bg-white border-2 border-slate-300 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 font-medium shadow-sm hover:border-slate-400"
                placeholder="e.g., machine learning, artificial intelligence, data analysis"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <Tag size={20} className="text-slate-400" />
              </div>
            </div>
            <p className="text-sm text-slate-500">Separate keywords with commas • Improves discoverability</p>
          </div>

          {/* Co-Authors */}
          <div className="space-y-3">
            <label htmlFor="coAuthors" className="block text-lg font-bold text-slate-900">
              Co-Authors (Optional)
            </label>
            <div className="relative">
              <input
                type="text"
                id="coAuthors"
                name="coAuthors"
                value={formData.coAuthors}
                onChange={handleChange}
                className="w-full px-6 py-4 bg-white border-2 border-slate-300 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 font-medium shadow-sm hover:border-slate-400"
                placeholder="John Doe, Jane Smith, etc."
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <Users size={20} className="text-slate-400" />
              </div>
            </div>
            <p className="text-sm text-slate-500">Separate names with commas • Include academic affiliations if known</p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-8 py-6 bg-gradient-to-r from-slate-50 to-white border-t border-slate-200 rounded-b-3xl flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-amber-500" />
            <p className="text-sm text-slate-600">
              All submissions undergo academic review • Approx. 7-14 business days
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/student/my-research')}
              className="px-6 py-3 border-2 border-slate-300 rounded-xl text-slate-700 font-bold hover:bg-slate-50 transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-bold hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-500 shadow-lg hover:shadow-xl hover:shadow-indigo-500/25 transform hover:-translate-y-0.5 disabled:hover:transform-none flex items-center gap-3"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  {resubmitData ? 'Updating...' : 'Submitting...'}
                </>
              ) : (
                <>
                  {resubmitData ? 'Update Research' : 'Submit for Review'}
                  <Upload size={18} />
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Submission Guidelines */}
      <div className="mt-10 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
            <Sparkles size={24} className="text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Submission Guidelines</h3>
            <p className="text-slate-700">Ensure your submission meets all academic requirements</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-white/80 border border-blue-100">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center">
              <CheckCircle size={16} className="text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-800">PDF Format Required</p>
              <p className="text-sm text-slate-600">Only PDF files accepted • Max 10MB</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-xl bg-white/80 border border-blue-100">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
              <FileText size={16} className="text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-800">Complete Information</p>
              <p className="text-sm text-slate-600">All required fields must be filled</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-xl bg-white/80 border border-blue-100">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center">
              <Tag size={16} className="text-purple-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-800">Proper Keywords</p>
              <p className="text-sm text-slate-600">Include relevant keywords for searchability</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-xl bg-white/80 border border-blue-100">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center">
              <Users size={16} className="text-amber-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-800">Author Attribution</p>
              <p className="text-sm text-slate-600">List all contributing authors correctly</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitResearch;