import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Upload, UserPlus, Sparkles, FileText, X } from 'lucide-react'

function CreateLeadModal({ onClose, onAddLead }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'New',
    source: 'Manual'
  })
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!formData.name || !formData.email || !formData.phone) return;

  try {
    const res = await fetch("http://localhost:5001/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const savedLead = await res.json();

    onAddLead(savedLead);  // ✅ This sends real saved data to App.jsx
    onClose();             // ✅ Closes modal
  } catch (error) {
    console.error("Failed to create lead:", error);
  }
};

  const processFile = async (file) => {
    if (!file) return

    setIsUploading(true)
    setUploadStatus('Processing document...')

    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)

      const response = await fetch('http://localhost:5001/api/ai/extract-document', {
        method: 'POST',
        body: formDataUpload,
      })

      const result = await response.json()

      if (result.success) {
        setFormData({
          name: result.data.name || '',
          email: result.data.email || '',
          phone: result.data.phone || '',
          status: 'New',
          source: 'Document'
        })
        setUploadStatus(`Document processed successfully! Confidence: ${(result.data.confidence * 100).toFixed(1)}%`)
      } else {
        setUploadStatus(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Upload error:', error)
      setUploadStatus('Error processing document. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    await processFile(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      // Check file type
      const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/bmp', 'image/tiff', 'image/gif', 'image/webp']
      if (allowedTypes.includes(file.type)) {
        await processFile(file)
      } else {
        setUploadStatus('Error: Please upload a supported file format (PDF, PNG, JPG, JPEG, BMP, TIFF, GIF, WEBP)')
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4 bg-white/95 backdrop-blur-md border-0 shadow-2xl fade-in-scale max-h-screen overflow-auto">
        <CardHeader className="border-b border-gray-200/50 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-lg">
                <UserPlus className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-[#001f3f]">Create New Lead</CardTitle>
                <p className="text-sm text-[#001f3f]">Add manually or use AI document extraction</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="hover:bg-gray-100 rounded-full p-2"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Manual Entry Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Sparkles className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold text-[#001f3f]">Manual Entry</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#001f3f] mb-2">Full Name</label>
                  <input
                    type="text"
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#001f3f] mb-2">Email Address</label>
                  <input
                    type="email"
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                    placeholder="Enter email address"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#001f3f] mb-2">Phone Number</label>
                <input
                  type="tel"
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  required
                  placeholder="Enter phone number"
                />
              </div>
            </div>
            
            {/* AI Document Extraction Section */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-[#001f3f]">AI Document Extraction</h3>
              </div>
              
              <div 
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                  isDragOver 
                    ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50 scale-105' 
                    : 'border-gray-300 hover:border-purple-400 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50'
                } ${isUploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-upload').click()}
              >
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.bmp,.tiff,.tif,.gif,.webp"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  disabled={isUploading}
                />
                
                <div className={`p-4 rounded-full mx-auto mb-4 w-16 h-16 flex items-center justify-center ${
                  isDragOver 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
                    : 'bg-gradient-to-r from-gray-100 to-gray-200'
                } transition-all duration-300`}>
                  <Upload className={`h-8 w-8 ${isDragOver ? 'text-white' : 'text-gray-400'}`} />
                </div>
                
                <p className={`text-lg font-medium mb-2 text-[#001f3f]`}>
                  {isUploading 
                    ? 'Processing Document...' 
                    : isDragOver 
                      ? 'Drop your file here' 
                      : 'Upload Document for AI Extraction'
                  }
                </p>
                
                <p className={`text-sm text-[#001f3f]`}>
                  {isUploading 
                    ? 'Please wait while AI analyzes your document' 
                    : isDragOver 
                      ? 'Release to upload' 
                      : 'Drag & drop your file here, or click to browse'
                  }
                </p>
                
                <p className="text-xs text-[#001f3f] mt-3">
                  Supports: PDF, PNG, JPG, JPEG, BMP, TIFF, GIF, WEBP
                </p>
              </div>
              
              {uploadStatus && (
                <div className={`mt-4 p-4 rounded-lg border-2 ${
                  uploadStatus.includes('Error') 
                    ? 'border-red-200 bg-red-50 text-red-700' 
                    : 'border-green-200 bg-green-50 text-green-700'
                }`}>
                  <p className="text-sm font-medium">{uploadStatus}</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t border-gray-200">
              <Button 
                type="submit" 
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                disabled={isUploading}
              >
                {isUploading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create Lead
                  </>
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="bg-white/80 backdrop-blur-md border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transform hover:scale-105 transition-all duration-200"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default CreateLeadModal