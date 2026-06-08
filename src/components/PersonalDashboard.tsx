import React, { useState, useEffect, useRef } from 'react';
import { dbService } from '../firebase';
import { 
  File, 
  Upload, 
  Trash2, 
  ShieldCheck, 
  Users, 
  Calendar, 
  FileText, 
  User, 
  ArrowLeft, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  HardDrive
} from 'lucide-react';
import { showToast } from '../lib/toast';

interface PersonalDashboardProps {
  currentUser: any;
  onClose: () => void;
}

export default function PersonalDashboard({ currentUser, onClose }: PersonalDashboardProps) {
  const isAdminView = currentUser?.uid === 'PqUn9o3KQAg0bUWQ78IsjedZPxK2';
  
  // Admin view states
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [allFiles, setAllFiles] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  
  // User files state
  const [userFiles, setUserFiles] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [confirmDeleteFileId, setConfirmDeleteFileId] = useState<string | null>(null);

  // Subscribe to Admin data or User private data
  useEffect(() => {
    if (!currentUser) return;
    setLoading(true);

    let unsubUsers: (() => void) | null = null;
    let unsubFiles: (() => void) | null = null;

    if (isAdminView) {
      // Admin: Listen to all users and all files
      unsubUsers = dbService.subscribeAllUsers((usersData) => {
        setAllUsers(usersData);
        setLoading(false);
      });

      unsubFiles = dbService.subscribeAllFiles((filesData) => {
        setAllFiles(filesData);
      });
    } else {
      // Normal Customer: Listen to own uploaded files only
      unsubFiles = dbService.subscribeUserFiles(currentUser.uid, (filesData) => {
        setUserFiles(filesData);
        setLoading(false);
      });
    }

    return () => {
      if (unsubUsers) unsubUsers();
      if (unsubFiles) unsubFiles();
    };
  }, [currentUser, isAdminView]);

  // Handle local simulation file upload
  const handleFileUpload = async (file: globalThis.File) => {
    if (!currentUser) {
      showToast('You must be signed in to upload files.', 'error', 'Auth Required');
      return;
    }

    setIsUploading(true);
    try {
      // Standard MIME-type to visual preview mapper
      let fileUrl = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80';
      
      // If image, we can try converting to base64 DataURL for true live rendering
      if (file.type.startsWith('image/') && file.size < 600000) {
        const reader = new FileReader();
        fileUrl = await new Promise<string>((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string || fileUrl);
          reader.readAsDataURL(file);
        });
      } else {
        // Generate nice mock assets for non-image types
        if (file.type.includes('pdf')) fileUrl = 'pdf';
        else if (file.type.includes('csv') || file.type.includes('excel') || file.type.includes('sheet')) fileUrl = 'sheet';
        else if (file.type.includes('zip') || file.type.includes('tar') || file.type.includes('rar')) fileUrl = 'archive';
        else if (file.type.includes('text') || file.type.includes('markdown')) fileUrl = 'text';
      }

      await dbService.uploadUserFile(
        currentUser.uid,
        file.name,
        file.size,
        file.type,
        fileUrl
      );

      // Trigger automatic User metadata validation in db
      await dbService.ensureUserProfile(currentUser.uid, currentUser.email || 'customer@laziz.in', currentUser.displayName);

      showToast(`File "${file.name}" uploaded successfully!`, 'success', 'Done');
    } catch (err: any) {
      showToast(err.message || 'Failed to complete file entry', 'error', 'Upload Error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleDeleteFile = async (fileId: string, fileName: string) => {
    try {
      await dbService.deleteUserFile(fileId);
      showToast('File unlinked successfully.', 'success', 'Removed');
      setConfirmDeleteFileId(null);
    } catch (err: any) {
      showToast(err.message || 'Could not delete file', 'error', 'Error');
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString([], {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-[#0b0c0e] min-h-screen text-white/90">
      {/* Dynamic Header */}
      <header className="bg-[#111216] border-b border-flame-orange/15 px-6 py-4 flex justify-between items-center sticky top-0 z-40 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-flame-orange/20 to-amber-500/20 border border-flame-orange/30 rounded-xl">
            <HardDrive className="w-5 h-5 text-flame-orange" />
          </div>
          <div>
            <h1 className="font-display text-xl tracking-wider uppercase text-white leading-none">
              {isAdminView ? 'Secure Files Admin Panel' : 'My Secure File Cloud'}
            </h1>
            <span className="font-mono text-[9px] text-zinc-500 tracking-wider block mt-1 uppercase">
              Laziz Chicken Corner Network • cloud server
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAdminView && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-red-500/10 to-flame-orange/15 border border-flame-orange/30 text-flame-orange font-mono text-[9px] font-black uppercase tracking-widest rounded-full animate-flicker-subtle shadow-[0_0_15px_rgba(255,107,0,0.1)]">
              <ShieldCheck className="w-3.5 h-3.5 text-flame-orange" />
              <span>Admin Profile Active</span>
            </span>
          )}
          
          <button
            onClick={onClose}
            className="bg-zinc-800/80 hover:bg-zinc-700 hover:text-white text-flame-gray font-accent text-[11px] uppercase px-4 py-2 rounded-lg transition-all border border-white/5 active:scale-95 duration-200"
          >
            Exit Dashboard
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="w-10 h-10 text-flame-orange animate-spin" />
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Compiling Database Assets...</p>
          </div>
        ) : isAdminView ? (
          /* ================= ADMIN VIEW ================= */
          <div className="space-y-6">
            
            {/* Admin Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#121319] border border-white/5 p-5 rounded-xl flex items-center gap-4 shadow-lg">
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <span className="font-mono text-[10px] text-zinc-500 uppercase block">Total System Users</span>
                  <span className="font-mono text-2xl font-bold text-white">{allUsers.length}</span>
                </div>
              </div>

              <div className="bg-[#121319] border border-white/5 p-5 rounded-xl flex items-center gap-4 shadow-lg">
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <span className="font-mono text-[10px] text-zinc-500 uppercase block">Total Hosted Files</span>
                  <span className="font-mono text-2xl font-bold text-white">{allFiles.length}</span>
                </div>
              </div>

              <div className="bg-[#121319] border border-white/5 p-5 rounded-xl flex items-center gap-4 shadow-lg">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <span className="font-mono text-[10px] text-zinc-500 uppercase block">Authorized ID</span>
                  <span className="font-mono text-xs font-bold text-emerald-400 truncate max-w-[170px] block" title={currentUser?.uid}>
                    PqUn9o3KQA...
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Users Table Column */}
              <div className="lg:col-span-7 bg-[#121319] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                <div className="px-5 py-4 border-b border-white/5 bg-[#15161c] flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-flame-orange" />
                    <h3 className="font-display text-sm uppercase tracking-wide text-white">Registered Users</h3>
                  </div>
                  <span className="font-mono text-[9px] text-[#FF9E00] uppercase tracking-wider bg-flame-orange/15 px-2 py-0.5 rounded font-bold">
                    Master List
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 font-mono text-[10px] text-zinc-500 uppercase bg-[#0d0e12]">
                        <th className="px-5 py-3">Email Address</th>
                        <th className="px-5 py-3">Acct Created</th>
                        <th className="px-5 py-3 text-right">Files</th>
                        <th className="px-5 py-3 text-center">Inspect</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-xs font-sans">
                      {allUsers.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="text-center py-8 text-zinc-500 font-mono text-[10px]">
                            NO REGISTERED USERS FOUND IN DATABASE
                          </td>
                        </tr>
                      ) : (
                        allUsers.map((usr) => {
                          const userSpecificFiles = allFiles.filter(f => f.userId === usr.uid || f.userId === usr.id);
                          const isSelected = selectedUser?.uid === usr.uid || selectedUser?.id === usr.id;
                          return (
                            <tr 
                              key={usr.uid || usr.id} 
                              className={`hover:bg-white/5 transition-colors duration-150 group cursor-pointer ${
                                isSelected ? 'bg-flame-orange/10' : ''
                              }`}
                              onClick={() => {
                                setSelectedUser(usr);
                              }}
                            >
                              <td className="px-5 py-3.5 font-medium text-white max-w-[180px] truncate">
                                {usr.email}
                              </td>
                              <td className="px-5 py-3.5 text-zinc-400 font-mono text-[11px]">
                                {formatDate(usr.createdAt)}
                              </td>
                              <td className="px-5 py-3.5 text-right font-mono text-flame-yellow font-bold">
                                {userSpecificFiles.length}
                              </td>
                              <td className="px-5 py-3.5 text-center">
                                <button
                                  className={`p-1.5 rounded-lg transition-transform text-white/50 group-hover:text-flame-orange ${
                                    isSelected ? 'text-flame-orange scale-105' : 'group-hover:scale-105'
                                  }`}
                                >
                                  <ChevronRight className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* User inspect details */}
              <div className="lg:col-span-5 bg-[#121319] border border-white/5 rounded-2xl p-6 shadow-2xl relative min-h-[300px]">
                {selectedUser ? (
                  <div className="space-y-6">
                    <div className="border-b border-white/5 pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-mono text-[9px] text-[#FF9E00] uppercase tracking-wider block">Inspecting User Context</span>
                          <h4 className="font-display text-base text-white truncate max-w-[280px]" title={selectedUser.email}>
                            {selectedUser.email}
                          </h4>
                          <span className="font-mono text-[9px] text-zinc-500 block leading-none mt-1">
                            UID: {selectedUser.uid || selectedUser.id}
                          </span>
                        </div>
                        <button
                          onClick={() => setSelectedUser(null)}
                          className="text-xs font-mono text-zinc-500 hover:text-white"
                        >
                          Clear
                        </button>
                      </div>
                    </div>

                    {/* Users specific file list */}
                    <div>
                      <h5 className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-3 font-semibold">
                        Uploaded Document Repositories
                      </h5>

                      {allFiles.filter(f => f.userId === selectedUser.uid || f.userId === selectedUser.id).length === 0 ? (
                        <div className="border border-dashed border-white/5 rounded-xl p-8 text-center text-zinc-500 font-mono text-[10px] space-y-2">
                          <AlertCircle className="w-6 h-6 mx-auto text-zinc-600" />
                          <p>THIS ACCOUNT CONTAINS NO ACTIVE FILE UPLOADS</p>
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                          {allFiles
                            .filter(f => f.userId === selectedUser.uid || f.userId === selectedUser.id)
                            .map((file) => (
                              <div 
                                key={file.id} 
                                className="bg-[#171922] border border-white/5 p-3 rounded-xl flex items-center justify-between gap-3 group/file"
                              >
                                <div className="flex items-center gap-3 overflow-hidden">
                                  <div className="w-10 h-10 shrink-0 bg-flame-black rounded-lg border border-white/10 flex items-center justify-center text-zinc-400 font-mono text-[8px] overflow-hidden">
                                    {file.fileUrl.startsWith('data:') || file.fileUrl.startsWith('http') ? (
                                      <img 
                                        src={file.fileUrl} 
                                        alt="" 
                                        className="w-full h-full object-cover"
                                        referrerPolicy="no-referrer"
                                      />
                                    ) : (
                                      <span className="uppercase text-[9px] font-bold text-flame-orange">{file.fileUrl}</span>
                                    )}
                                  </div>
                                  <div className="overflow-hidden">
                                    <span 
                                      className="block text-xs font-medium text-white truncate max-w-[170px]" 
                                      title={file.fileName}
                                    >
                                      {file.fileName}
                                    </span>
                                    <span className="block font-mono text-[9px] text-zinc-500 leading-none mt-1">
                                      {formatBytes(file.fileSize)} • {formatDate(file.uploadedAt).split(',')[0]}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  {file.fileUrl.startsWith('data:') && (
                                    <a
                                      href={file.fileUrl}
                                      download={file.fileName}
                                      className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-md transition-colors"
                                      title="Download File"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                  )}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (confirmDeleteFileId === file.id) {
                                        handleDeleteFile(file.id, file.fileName);
                                      } else {
                                        setConfirmDeleteFileId(file.id);
                                        setTimeout(() => setConfirmDeleteFileId(current => current === file.id ? null : current), 4000);
                                      }
                                    }}
                                    className={`p-1.5 rounded-md transition-all font-accent flex items-center gap-1 text-[10px] uppercase font-bold border ${
                                      confirmDeleteFileId === file.id 
                                        ? "bg-red-600 border-red-500 text-white animate-pulse" 
                                        : "bg-red-950/30 hover:bg-red-950 hover:text-red-400 text-zinc-500 border-red-900/10 hover:border-red-900/30"
                                    }`}
                                    title={confirmDeleteFileId === file.id ? "Click again to confirm" : "Administrative Deletion"}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    {confirmDeleteFileId === file.id && <span className="text-[8px] animate-pulse">Sure?</span>}
                                  </button>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>

                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-zinc-500 space-y-3 font-sans">
                    <User className="w-10 h-10 text-zinc-700 animate-pulse" />
                    <div className="space-y-1">
                      <p className="font-mono text-[10px] text-flame-yellow uppercase tracking-widest font-black">No User Selected</p>
                      <p className="text-xs max-w-[240px] leading-relaxed text-zinc-500 font-medium">
                        Click on any registered user record in the sheet to inspect their diagnostic details and file repositories.
                      </p>
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>
        ) : (
          /* ================= USER CLOUD SERVICE VIEW ================= */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Upload Card Panel */}
            <div className="lg:col-span-5 bg-[#121319] border border-white/5 rounded-2xl p-6 shadow-2xl space-y-6">
              
              <div>
                <span className="font-mono text-[9px] text-[#FF9E00] uppercase tracking-widest block font-bold mb-1">
                  Secure Repository Gate
                </span>
                <h3 className="font-display text-lg uppercase tracking-wide text-white">Upload New Documents</h3>
                <p className="text-xs text-zinc-500 leading-relaxed font-sans mt-1.5">
                  Secure backups of your pickup slips, catering agreements, dining journals, or proof receipts. Standard assets accepted.
                </p>
              </div>

              {/* Drag/Drop area */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 relative ${
                  dragActive 
                    ? 'border-flame-orange bg-flame-orange/5 scale-[0.99] shadow-[0_0_20px_rgba(255,107,0,0.05)]' 
                    : 'border-white/10 hover:border-flame-orange/40 hover:bg-white/2'
                }`}
              >
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelectChange}
                  className="hidden"
                />

                {isUploading ? (
                  <div className="space-y-3 py-4">
                    <Loader2 className="w-8 h-8 text-flame-orange animate-spin mx-auto" />
                    <div className="space-y-1">
                      <p className="font-mono text-[10px] text-flame-orange uppercase font-black tracking-widest">Uploading file...</p>
                      <p className="text-[10px] text-zinc-500 font-sans">Negotiating database packets</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 py-2">
                    <div className="w-12 h-12 bg-zinc-800/60 rounded-full flex items-center justify-center mx-auto border border-white/5 shadow-inner">
                      <Upload className="w-5 h-5 text-flame-orange" />
                    </div>
                    <div className="space-y-1 font-sans">
                      <p className="text-xs font-semibold text-white">Click or drag files here</p>
                      <p className="text-[10px] text-zinc-500 leading-normal">
                        Images (PNG, JPG) up to 500KB render live! <br />
                        Docs, Archives, or PDFs are accepted.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Security Banner */}
              <div className="bg-[#171922] border border-white/5 rounded-xl p-4 flex gap-3 text-xs leading-normal">
                <ShieldCheck className="w-5 h-5 text-flame-orange shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-white uppercase text-[10px] tracking-wide">Decentralized Rule Isolation</p>
                  <p className="text-zinc-500 font-sans text-[11px]">
                    Firebase network security locks down your cloud storage matches. Only you and network master controllers possess view credentials.
                  </p>
                </div>
              </div>

            </div>

            {/* Right List Panel */}
            <div className="lg:col-span-7 bg-[#121319] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
              
              <div className="px-5 py-4 border-b border-white/5 bg-[#15161c] flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <File className="w-4 h-4 text-flame-orange" />
                  <h3 className="font-display text-sm uppercase tracking-wide text-white">My Uploaded Slips</h3>
                </div>
                <span className="font-mono text-[10px] text-zinc-400 tracking-wider">
                  Total: {userFiles.length} files
                </span>
              </div>

              {userFiles.length === 0 ? (
                <div className="py-20 text-center space-y-4 font-sans px-6">
                  <div className="w-16 h-16 bg-zinc-800/30 rounded-full flex items-center justify-center mx-auto border border-white/5 shadow-inner">
                    <FileText className="w-7 h-7 text-zinc-600 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-zinc-400">Your cloud space is empty</h4>
                    <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">
                      Upload your food tickets or catering records. They will persist securely in your personal list.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-white/5 h-[450px] overflow-y-auto">
                  {userFiles.map((file) => (
                    <div 
                      key={file.id} 
                      className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-white/2 transition-colors duration-150 group"
                    >
                      <div className="flex items-center gap-4 overflow-hidden">
                        {/* File preview block */}
                        <div className="w-12 h-12 bg-flame-black rounded-lg border border-white/10 flex items-center justify-center text-zinc-400 font-mono text-[8.5px] overflow-hidden shrink-0">
                          {file.fileUrl.startsWith('data:') || file.fileUrl.startsWith('http') ? (
                            <img 
                              src={file.fileUrl} 
                              alt="" 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <span className="font-extrabold uppercase text-flame-orange text-[10px]">{file.fileUrl}</span>
                          )}
                        </div>

                        <div className="overflow-hidden">
                          <span 
                            className="block text-xs font-semibold text-white group-hover:text-flame-orange transition-colors truncate max-w-[240px] md:max-w-md"
                            title={file.fileName}
                          >
                            {file.fileName}
                          </span>
                          <span className="block font-mono text-[9px] text-zinc-500 leading-none mt-1.5">
                            {formatBytes(file.fileSize)} • Type: <strong className="text-zinc-400 uppercase font-bold">{file.fileType.split('/')[1] || 'Unknown'}</strong> • {formatDate(file.uploadedAt)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {file.fileUrl.startsWith('data:') && (
                          <a
                            href={file.fileUrl}
                            download={file.fileName}
                            className="p-2 bg-gradient-to-tr from-zinc-800 to-zinc-900 border border-white/5 hover:bg-zinc-700 text-white rounded-lg transition-colors shadow-md active:scale-95"
                            title="Download document backup"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirmDeleteFileId === file.id) {
                              handleDeleteFile(file.id, file.fileName);
                            } else {
                              setConfirmDeleteFileId(file.id);
                              setTimeout(() => setConfirmDeleteFileId(current => current === file.id ? null : current), 4000);
                            }
                          }}
                          className={`p-2 border rounded-lg transition-all cursor-pointer font-accent shadow-md active:scale-95 flex items-center gap-1.5 text-xs font-bold ${
                            confirmDeleteFileId === file.id
                              ? "bg-red-600 border-red-500 text-white animate-pulse"
                              : "bg-red-950/20 hover:bg-red-950 border border-red-900/10 hover:border-red-900/40 hover:text-red-400 text-zinc-600"
                          }`}
                          title={confirmDeleteFileId === file.id ? "Click again to confirm delete" : "Delete File"}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          {confirmDeleteFileId === file.id && <span className="text-[10px]">Confirm?</span>}
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              )}

            </div>

          </div>
        )}

      </div>
    </div>
  );
}