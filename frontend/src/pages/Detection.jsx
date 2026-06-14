import { useState, useRef } from 'react';
import { Upload, Camera, Download, AlertCircle, RefreshCw, BarChart, Percent } from 'lucide-react';
import apiService from '../services/api';
import Toast from '../components/Toast';

export const Detection = () => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        processSelectedFile(droppedFile);
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        processSelectedFile(selectedFile);
      }
    }
  };

  const validateFile = (file) => {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError("Supported file types are PNG, JPEG, JPG, and WEBP.");
      return false;
    }
    setError(null);
    return true;
  };

  const processSelectedFile = (file) => {
    setFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResults(null); // Clear previous results
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  const runDetection = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.predict(file);
      setResults(data);
      setToast({
        message: `Successfully processed image! Detected ${data.total_products} items.`,
        type: 'success'
      });
    } catch (e) {
      console.error(e);
      setError(e.response?.data?.error || "Connection refused. Ensure the Flask backend is running on port 5000.");
      setToast({
        message: "Failed to perform product recognition.",
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    setFile(null);
    setPreviewUrl(null);
    setResults(null);
    setError(null);
  };

  // Download CSV report
  const downloadReport = () => {
    if (!results) return;
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Product Name,Detected Count,Average Confidence Score\r\n";
    
    results.products.forEach(p => {
      csvContent += `${p.name},${p.count},${Math.round(p.confidence * 100)}%\r\n`;
    });
    
    csvContent += `\r\nTotal Products,${results.total_products},`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `VisionVend_Detection_Report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  return (
    <div className="space-y-8 max-w-6xl mx-auto relative">
      {/* Toast Alert popup */}
      {toast && (
        <div className="fixed top-5 right-5 z-50">
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}

      {/* Header Info */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Product Detection Scanner</h2>
          <p className="text-slate-400 text-sm">Upload shelf photos to scan beverage stocks and verify package inventory.</p>
        </div>
        
        {results && (
          <div className="flex gap-3">
            <button 
              onClick={resetScanner}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-slate-700 bg-slate-900/60 hover:bg-slate-900 text-slate-300 transition"
            >
              <RefreshCw className="h-4 w-4" /> Reset Scanner
            </button>
            <button 
              onClick={downloadReport}
              className="btn-premium flex items-center gap-2 text-sm text-white"
            >
              <Download className="h-4 w-4" /> Export Report (CSV)
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="glass-panel border-rose-500/20 p-4 rounded-xl flex items-center gap-3 bg-rose-500/5 text-rose-300 text-sm">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Zone & Pre-infer preview */}
      {!results && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* File drag-and-drop container */}
          <div 
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`glass-panel border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 flex flex-col items-center justify-center min-h-[350px] ${
              dragActive 
                ? 'border-indigo-500 bg-indigo-500/5 scale-[0.99]' 
                : 'border-slate-800 hover:border-slate-700 hover:bg-slate-900/10'
            }`}
          >
            <input 
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept="image/*"
            />
            
            <div className="p-4 bg-slate-900/80 rounded-full border border-slate-800 text-indigo-400 mb-4 shadow-lg">
              <Upload className="h-8 w-8" />
            </div>
            
            <h3 className="text-lg font-semibold text-slate-200 mb-1">Drag and drop shelf image</h3>
            <p className="text-xs text-slate-500 mb-6 max-w-xs">Supports PNG, JPG, JPEG, or WEBP. Limit size up to 10MB.</p>
            
            <button 
              onClick={triggerFileSelect}
              className="px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-900 text-slate-300 text-sm font-semibold transition"
            >
              Browse Files
            </button>
          </div>

          {/* Selected Image Preview Panel */}
          <div className="glass-panel rounded-3xl p-6 flex flex-col justify-between min-h-[350px]">
            <div className="flex-1 flex items-center justify-center overflow-hidden rounded-2xl bg-slate-950/40 border border-slate-900 relative">
              {previewUrl ? (
                <img 
                  src={previewUrl} 
                  alt="Shelf upload preview" 
                  className="max-h-[300px] w-auto object-contain rounded-xl"
                />
              ) : (
                <div className="text-center p-6 space-y-2">
                  <Camera className="h-10 w-10 text-slate-600 mx-auto" />
                  <p className="text-slate-500 text-xs font-medium">Select or upload a shelf image to view preview</p>
                </div>
              )}
            </div>

            <div className="mt-6">
              <button
                onClick={runDetection}
                disabled={!file}
                className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                  file 
                    ? 'btn-premium text-white' 
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
                }`}
              >
                <Camera className="h-5 w-5" /> Analyze Stock with YOLOv8
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State view */}
      {loading && (
        <div className="glass-panel p-16 rounded-3xl text-center space-y-6 animate-pulse">
          <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-400 animate-spin mx-auto" />
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-200">Running AI Inference Engine...</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Scanning shelf grid, drawing bounding boxes, and calculating item stock totals in database.
            </p>
          </div>
        </div>
      )}

      {/* Results State view */}
      {results && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Annotated output image */}
          <div className="lg:col-span-7 space-y-3">
            <h3 className="text-sm font-semibold text-slate-400 tracking-wide uppercase">Annotated Shelf Capture</h3>
            <div className="glass-panel rounded-3xl p-4 flex items-center justify-center bg-slate-950/60 overflow-hidden border border-white/5 min-h-[400px]">
              <img 
                src={`${backendUrl}${results.annotated_image}`} 
                alt="YOLOv8 annotated shelf view" 
                className="max-h-[500px] w-auto object-contain rounded-xl shadow-lg border border-slate-900"
                onError={(e) => {
                  e.target.src = previewUrl; // Fallback to preview on network delay
                }}
              />
            </div>
          </div>

          {/* Counts & metrics details table */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-400 tracking-wide uppercase">Scan Summary Metrics</h3>
              
              {/* Mini cards grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-panel p-4 rounded-2xl flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg">
                    <BarChart className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Detected Count</p>
                    <p className="text-lg font-bold text-slate-100">{results.total_products}</p>
                  </div>
                </div>

                <div className="glass-panel p-4 rounded-2xl flex items-center gap-3">
                  <div className="p-2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-lg">
                    <Percent className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Avg Confidence</p>
                    <p className="text-lg font-bold text-slate-100">
                      {results.products.length > 0 
                        ? `${Math.round((results.products.reduce((acc, curr) => acc + curr.confidence, 0) / results.products.length) * 100)}%`
                        : 'N/A'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Counts Table */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-400 tracking-wide uppercase">Detected Products Inventory</h3>
              
              <div className="glass-panel rounded-2xl overflow-hidden border border-white/5">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-900/60 border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase">
                      <tr>
                        <th className="px-6 py-4">Product Category</th>
                        <th className="px-6 py-4 text-center">Unit Count</th>
                        <th className="px-6 py-4 text-right">Confidence Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {results.products.length > 0 ? (
                        results.products.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/15 transition-colors">
                            <td className="px-6 py-4 font-semibold text-slate-200">{item.name}</td>
                            <td className="px-6 py-4 text-center font-bold text-indigo-400 bg-indigo-500/5">{item.count}</td>
                            <td className="px-6 py-4 text-right">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                {Math.round(item.confidence * 100)}%
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="px-6 py-10 text-center text-slate-500 font-medium">
                            No products were recognized in this shelf upload scan.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Detection;
