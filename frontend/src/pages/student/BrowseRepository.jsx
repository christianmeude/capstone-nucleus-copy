import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Calendar, 
  User, 
  Tag, 
  FileText, 
  ExternalLink,
  Grid,
  List,
  TrendingUp,
  ChevronRight,
  Hash,
  Clock,
  BookOpen,
  GraduationCap,
  Building,
  Award,
  Star,
  Sparkles,
  X,
  ChevronDown,
  SortAsc,
  RefreshCw,
  Info,
  Bookmark,
  Share2,
  Copy,
  Heart
} from 'lucide-react';
import { researchAPI } from '../../utils/api';

const BrowseRepository = () => {
  const navigate = useNavigate();
  const [papers, setPapers] = useState([]);
  const [filteredPapers, setFilteredPapers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [expandedPaper, setExpandedPaper] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState({
    category: '',
    sort: 'newest',
    search: ''
  });

  // Stats
  const [stats, setStats] = useState({
    totalPapers: 0,
    totalAuthors: 0,
    totalDownloads: 0,
    totalViews: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterAndSortPapers();
  }, [papers, searchTerm, selectedCategory, sortBy]);

  const fetchData = async () => {
    try {
      const [papersRes, categoriesRes] = await Promise.all([
        researchAPI.getPublishedResearch(),
        researchAPI.getCategories()
      ]);
      
      setPapers(papersRes.data.papers);
      setCategories(categoriesRes.data.categories || []);
      
      // Calculate stats
      const uniqueAuthors = new Set(papersRes.data.papers.map(p => p.users?.id));
      const totalDownloads = papersRes.data.papers.reduce((sum, p) => sum + (p.download_count || 0), 0);
      const totalViews = papersRes.data.papers.reduce((sum, p) => sum + (p.view_count || 0), 0);
      
      setStats({
        totalPapers: papersRes.data.papers.length,
        totalAuthors: uniqueAuthors.size,
        totalDownloads,
        totalViews
      });
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortPapers = () => {
    let filtered = [...papers];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(paper =>
        paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        paper.abstract.toLowerCase().includes(searchTerm.toLowerCase()) ||
        paper.users?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        paper.keywords?.some(keyword => 
          keyword.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(paper => paper.category === selectedCategory);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.published_date || b.created_at) - new Date(a.published_date || a.created_at);
        case 'oldest':
          return new Date(a.published_date || a.created_at) - new Date(b.published_date || b.created_at);
        case 'most_viewed':
          return (b.view_count || 0) - (a.view_count || 0);
        case 'most_downloaded':
          return (b.download_count || 0) - (a.download_count || 0);
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    setFilteredPapers(filtered);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getCategoryName = (categoryId) => {
    if (!categoryId) return 'General';
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'General';
  };

  const getCategoryColor = (categoryId) => {
    const colors = [
      'from-blue-500 to-cyan-500',
      'from-indigo-500 to-blue-500',
      'from-purple-500 to-pink-500',
      'from-green-500 to-emerald-500',
      'from-amber-500 to-orange-500',
      'from-red-500 to-pink-500',
      'from-teal-500 to-green-500',
      'from-violet-500 to-purple-500'
    ];
    if (!categoryId) return 'from-gray-500 to-slate-500';
    const index = categories.findIndex(cat => cat.id === categoryId);
    return colors[index % colors.length] || 'from-gray-500 to-slate-500';
  };

  const handleDownload = async (paper, e) => {
    e.stopPropagation();
    try {
      window.open(paper.file_url, '_blank');
      // Optional: Track download here
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const handleViewDetails = (paper) => {
    // Navigate to paper detail page
    navigate(`/research/${paper.id}`);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSortBy('newest');
    setShowCategoryDropdown(false);
    setShowSortDropdown(false);
  };

  const togglePaperExpand = (paperId, e) => {
    e.stopPropagation();
    setExpandedPaper(expandedPaper === paperId ? null : paperId);
  };

  const sortOptions = [
    { value: 'newest', label: 'Newest First', icon: Clock },
    { value: 'oldest', label: 'Oldest First', icon: Calendar },
    { value: 'most_viewed', label: 'Most Viewed', icon: Eye },
    { value: 'most_downloaded', label: 'Most Downloaded', icon: Download },
    { value: 'title', label: 'Title (A-Z)', icon: SortAsc }
  ];

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setShowCategoryDropdown(false);
  };

  const handleSortSelect = (sortValue) => {
    setSortBy(sortValue);
    setShowSortDropdown(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-indigo-100 rounded-full"></div>
            <div className="absolute top-0 left-0 w-20 h-20 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="mt-6 text-lg font-medium text-slate-600 animate-pulse">Loading research repository...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 text-indigo-700 text-sm font-semibold mb-6">
            <Sparkles size={16} />
            National University Dasmariñas
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
            Research <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">Repository</span>
          </h1>
          
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-10">
            Discover, explore, and download published academic research from our university community
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-10">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="text-2xl font-black text-slate-900">{stats.totalPapers}</div>
              <div className="text-sm text-slate-600 font-medium">Research Papers</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="text-2xl font-black text-blue-600">{stats.totalAuthors}</div>
              <div className="text-sm text-slate-600 font-medium">Unique Authors</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="text-2xl font-black text-green-600">{stats.totalViews.toLocaleString()}</div>
              <div className="text-sm text-slate-600 font-medium">Total Views</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="text-2xl font-black text-indigo-600">{stats.totalDownloads.toLocaleString()}</div>
              <div className="text-sm text-slate-600 font-medium">Downloads</div>
            </div>
          </div>
        </div>

        {/* Main Search and Filter Bar */}
        <div className="mb-10">
          {/* Search Bar */}
          <div className="relative mb-6 max-w-3xl mx-auto">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-slate-400" size={24} />
              <input
                type="text"
                placeholder="Search research papers, authors, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-32 py-4 bg-white border-2 border-slate-300 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 text-lg shadow-lg"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                {(searchTerm || selectedCategory) && (
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            
            {/* Search Tips */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-sm text-slate-500">
              <span className="flex items-center gap-2">
                <Info size={14} />
                Try searching for:
              </span>
              <button onClick={() => setSearchTerm('machine learning')} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full hover:bg-slate-200 transition-colors">
                machine learning
              </button>
              <button onClick={() => setSearchTerm('artificial intelligence')} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full hover:bg-slate-200 transition-colors">
                AI
              </button>
              <button onClick={() => setSearchTerm('data science')} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full hover:bg-slate-200 transition-colors">
                data science
              </button>
            </div>
          </div>

          {/* Filter Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            {/* Results Count */}
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-slate-100 to-white border border-slate-300">
                <span className="text-sm font-medium text-slate-700">
                  {filteredPapers.length} of {papers.length} papers
                </span>
              </div>
              {(searchTerm || selectedCategory) && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2"
                >
                  <X size={16} />
                  Clear filters
                </button>
              )}
            </div>

            {/* Desktop Filter Controls */}
            <div className="hidden md:flex items-center gap-4">
              {/* View Controls */}
              <div className="flex bg-slate-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'grid' 
                      ? 'bg-white text-slate-900 shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Grid view"
                >
                  <Grid size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'list' 
                      ? 'bg-white text-slate-900 shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="List view"
                >
                  <List size={20} />
                </button>
              </div>

              {/* Category Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-slate-100 to-white border border-slate-300 rounded-xl hover:border-indigo-300 transition-colors min-w-[200px]"
                >
                  <BookOpen size={18} className="text-indigo-600" />
                  <span className="flex-1 text-left text-sm font-medium text-slate-700">
                    {selectedCategory ? getCategoryName(selectedCategory) : 'All Categories'}
                  </span>
                  <ChevronDown size={18} className={`text-slate-500 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showCategoryDropdown && (
                  <div className="absolute z-10 mt-2 w-full bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                    <div className="py-2 max-h-60 overflow-y-auto">
                      <button
                        onClick={() => handleCategorySelect('')}
                        className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors hover:bg-slate-50 ${
                          selectedCategory === '' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700'
                        }`}
                      >
                        All Categories ({categories.length})
                      </button>
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => handleCategorySelect(category.id)}
                          className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors hover:bg-slate-50 flex items-center justify-between ${
                            selectedCategory === category.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700'
                          }`}
                        >
                          <span>{category.name}</span>
                          {selectedCategory === category.id && (
                            <ChevronRight size={16} />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-slate-100 to-white border border-slate-300 rounded-xl hover:border-indigo-300 transition-colors min-w-[180px]"
                >
                  <SortAsc size={18} className="text-indigo-600" />
                  <span className="flex-1 text-left text-sm font-medium text-slate-700">
                    {sortOptions.find(opt => opt.value === sortBy)?.label || 'Sort By'}
                  </span>
                  <ChevronDown size={18} className={`text-slate-500 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showSortDropdown && (
                  <div className="absolute z-10 mt-2 w-full bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                    <div className="py-2">
                      {sortOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                          <button
                            key={option.value}
                            onClick={() => handleSortSelect(option.value)}
                            className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors hover:bg-slate-50 flex items-center gap-3 ${
                              sortBy === option.value ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700'
                            }`}
                          >
                            <Icon size={18} />
                            <span className="flex-1">{option.label}</span>
                            {sortBy === option.value && (
                              <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Refresh Button */}
              <button
                onClick={fetchData}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-slate-100 to-white border border-slate-300 text-slate-700 hover:border-indigo-300 transition-colors"
                title="Refresh data"
              >
                <RefreshCw size={18} />
              </button>
            </div>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="md:hidden flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-slate-100 to-white border border-slate-300 rounded-xl hover:border-indigo-300 transition-colors"
            >
              <Filter size={18} />
              <span className="text-sm font-medium text-slate-700">Filters</span>
            </button>
          </div>
        </div>

        {/* Mobile Filters Modal */}
        {showMobileFilters && (
          <div className="md:hidden mb-8">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900">Filters</h3>
                <button onClick={() => setShowMobileFilters(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Categories */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <BookOpen size={16} />
                    Categories
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleCategorySelect('')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedCategory === '' 
                          ? 'bg-indigo-600 text-white' 
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      All
                    </button>
                    {categories.slice(0, 6).map((category) => (
                      <button
                        key={category.id}
                        onClick={() => handleCategorySelect(category.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          selectedCategory === category.id 
                            ? 'bg-indigo-600 text-white' 
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <SortAsc size={16} />
                    Sort By
                  </label>
                  <div className="space-y-2">
                    {sortOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <button
                          key={option.value}
                          onClick={() => handleSortSelect(option.value)}
                          className={`w-full flex items-center justify-between p-3 rounded-xl border transition-colors ${
                            sortBy === option.value 
                              ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon size={18} />
                            <span>{option.label}</span>
                          </div>
                          {sortBy === option.value && (
                            <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* View Mode */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-3">View Mode</label>
                  <div className="flex bg-slate-100 rounded-xl p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`flex-1 p-3 rounded-lg text-center transition-all ${
                        viewMode === 'grid' 
                          ? 'bg-white text-slate-900 shadow-sm' 
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Grid size={20} className="mx-auto mb-1" />
                      <span className="text-xs">Grid</span>
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`flex-1 p-3 rounded-lg text-center transition-all ${
                        viewMode === 'list' 
                          ? 'bg-white text-slate-900 shadow-sm' 
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <List size={20} className="mx-auto mb-1" />
                      <span className="text-xs">List</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Papers Grid/List */}
        {filteredPapers.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center mx-auto mb-6">
              <FileText size={32} className="text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">No research papers found</h3>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              {searchTerm || selectedCategory
                ? 'No papers match your search criteria. Try different keywords or clear filters.'
                : 'The repository is currently empty. Check back later for new research.'}
            </p>
            {(searchTerm || selectedCategory) && (
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-gradient-to-r from-slate-100 to-white border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPapers.map((paper) => (
              <div
                key={paper.id}
                onClick={() => handleViewDetails(paper)}
                className="group bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg hover:border-indigo-200 transition-all duration-300 overflow-hidden cursor-pointer"
              >
                {/* Category Badge */}
                <div className={`h-2 bg-gradient-to-r ${getCategoryColor(paper.category)}`}></div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <span className="px-3 py-1 rounded-full bg-gradient-to-r from-slate-100 to-slate-50 text-slate-700 text-xs font-medium">
                      {getCategoryName(paper.category)}
                    </span>
                    <div className="flex gap-3 text-slate-500 text-xs">
                      <span className="flex items-center gap-1">
                        <Eye size={12} />
                        {paper.view_count?.toLocaleString() || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Download size={12} />
                        {paper.download_count?.toLocaleString() || 0}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-indigo-700 transition-colors">
                    {paper.title}
                  </h3>

                  <p className="text-sm text-slate-600 mb-4 line-clamp-3">
                    {paper.abstract}
                  </p>

                  {/* Author & Date */}
                  <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                    <div className="flex items-center gap-2">
                      <User size={14} />
                      <span>{paper.users?.full_name || 'Researcher'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      {formatDate(paper.published_date || paper.created_at)}
                    </div>
                  </div>

                  {/* Keywords (Collapsible) */}
                  {paper.keywords && paper.keywords.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {paper.keywords.slice(0, 3).map((keyword, index) => (
                          <span
                            key={index}
                            className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs rounded-full"
                          >
                            {keyword}
                          </span>
                        ))}
                        {paper.keywords.length > 3 && (
                          <button
                            onClick={(e) => togglePaperExpand(paper.id, e)}
                            className="px-2.5 py-1 text-xs text-indigo-600 hover:text-indigo-700"
                          >
                            +{paper.keywords.length - 3} more
                          </button>
                        )}
                      </div>
                      {expandedPaper === paper.id && (
                        <div className="flex flex-wrap gap-2">
                          {paper.keywords.slice(3).map((keyword, index) => (
                            <span
                              key={index}
                              className="px-2.5 py-1 bg-slate-50 text-slate-600 text-xs rounded-full"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-slate-100">
                    <button
                      onClick={(e) => handleDownload(paper, e)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all font-medium text-sm"
                    >
                      <Download size={16} />
                      Download PDF
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(paper.file_url, '_blank');
                      }}
                      className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl hover:border-slate-400 transition-colors"
                      title="Preview PDF"
                    >
                      <ExternalLink size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPapers.map((paper) => (
              <div
                key={paper.id}
                onClick={() => handleViewDetails(paper)}
                className="group bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg hover:border-indigo-200 transition-all duration-300 cursor-pointer"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`px-3 py-1 rounded-full bg-gradient-to-r ${getCategoryColor(paper.category)} text-white text-xs font-bold`}>
                              {getCategoryName(paper.category)}
                            </span>
                            <div className="flex gap-4 text-sm text-slate-500">
                              <span className="flex items-center gap-1">
                                <Eye size={14} />
                                {paper.view_count?.toLocaleString() || 0} views
                              </span>
                              <span className="flex items-center gap-1">
                                <Download size={14} />
                                {paper.download_count?.toLocaleString() || 0} downloads
                              </span>
                            </div>
                          </div>
                          
                          <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-700 transition-colors">
                            {paper.title}
                          </h3>
                        </div>
                      </div>

                      <p className="text-slate-600 mb-4 line-clamp-2">
                        {paper.abstract}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                        <div className="flex items-center gap-2">
                          <User size={14} />
                          <span className="font-medium">{paper.users?.full_name || 'Researcher'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar size={14} />
                          <span>Published {formatDate(paper.published_date || paper.created_at)}</span>
                        </div>
                        {paper.keywords && paper.keywords.length > 0 && (
                          <div className="flex items-center gap-2">
                            <Tag size={14} />
                            <span>{paper.keywords.slice(0, 2).join(', ')}</span>
                            {paper.keywords.length > 2 && (
                              <span className="text-slate-400">+{paper.keywords.length - 2} more</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 lg:w-48">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(paper);
                        }}
                        className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                      >
                        <Eye size={16} />
                        View Details
                      </button>
                      <button
                        onClick={(e) => handleDownload(paper, e)}
                        className="px-4 py-3 border border-slate-300 text-slate-700 rounded-xl hover:border-slate-400 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                      >
                        <Download size={16} />
                        Download PDF
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results Footer */}
        {filteredPapers.length > 0 && (
          <div className="mt-10 text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-slate-50 to-white border border-slate-200 rounded-xl">
              <FileText size={18} className="text-indigo-600" />
              <div>
                <p className="text-sm font-medium text-slate-700">
                  Showing {filteredPapers.length} of {papers.length} research papers
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Click on any paper to view full details • Use filters to narrow results
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseRepository;