"use client";
import { useEffect, useState } from "react";
import { generatePdf } from "./actions/genratePdf";
import type { IApplication } from "@/types";
import dynamic from "next/dynamic";
import { getTemplate, saveTemplate } from "./actions/templateAction";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"));

export default function Home() {
  const [formData, setFormData] = useState<IApplication>({
    name: "",
    phoneno: "",
    address: "",
  });
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const [mode, setMode] = useState<"form" | "editor">("form");
  const [isLoading, setIsLoading] = useState(false);

  const [templateContent, setTemplateContent] = useState<string>("Loading..");
  const templateName = "StandardTemplate";

  useEffect(() => {
    const fetchTemplate = async () => {
      const content = await getTemplate(templateName);
      setTemplateContent(content);
    };
    fetchTemplate();
  }, []);

  const handleSaveTemplate = async () => {
    setIsLoading(true);
    try {
      const saved = await saveTemplate(templateName, templateContent);
      if(saved) {
        alert("Template saves Successfully");
      }
    } catch (error) {
      console.error("Saving template error")
    } finally{
      setIsLoading(false)
    }
  };

  const createBlobUrl = (base64: string) => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteNumbers.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "application/pdf" });
    return URL.createObjectURL(blob);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const base64 = await generatePdf(formData);
      if (!base64) {
        alert("PDF generation failed , please try again.");
        return;
      }
      const url = createBlobUrl(base64);
      setPdfUrl(url);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Check the console.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!pdfUrl) return;
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = `${formData.name || "Applicant"}_Document.pdf`;
    link.click();
  };

  const handleReset = () => {
    setPdfUrl(null);
  };

  // ============================
  // UI: PREVIEW STATE
  // ============================
  if (pdfUrl) {
    return (
      <div className="p-10 max-w-3xl mx-auto flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-4">Document Preview</h1>

        {/* The PDF Viewer */}
        <iframe
          src={pdfUrl}
          className="w-full h-[600px] border-2 border-gray-300 rounded shadow-lg mb-6"
          title="PDF Preview"
        />

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleDownload}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 font-semibold"
          >
            Download PDF
          </button>
          <button
            onClick={handleReset}
            className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
          >
            Create Another
          </button>
        </div>
      </div>
    );
  }

  // ============================
  // UI: DASHBOARD (FORM OR EDITOR)
  // ============================
  return (
    <div className="p-10 max-w-4xl mx-auto" data-color-mode="light">
      
      {/* --- Dashboard Header & Navigation --- */}
      <div className="flex justify-between items-center mb-8 pb-4 border-b">
        <h1 className="text-3xl font-bold text-gray-800">HR PDF Tool</h1>
        <div className="flex gap-2">
          <button 
            onClick={() => setMode('form')}
            className={`px-4 py-2 rounded font-semibold transition-colors ${mode === 'form' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Generate PDF
          </button>
          <button 
            onClick={() => setMode('editor')}
            className={`px-4 py-2 rounded font-semibold transition-colors ${mode === 'editor' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Edit Template
          </button>
        </div>
      </div>

      {/* --- RENDER: EDITOR MODE --- */}
      {mode === 'editor' && (
        <div className="animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-600">
              Available tags: <code>{'{{name}}'}</code>, <code>{'{{phoneno}}'}</code>, <code>{'{{address}}'}</code>
            </p>
            <button 
              onClick={handleSaveTemplate} 
              disabled={isLoading}
              className="bg-green-600 text-white px-6 py-2 rounded font-bold hover:bg-green-700 transition-colors"
            >
              {isLoading ? "Saving..." : "Save to DB"}
            </button>
          </div>
          <div className="border shadow-sm rounded">
            <MDEditor 
              value={templateContent} 
              onChange={(val) => setTemplateContent(val || '')} 
              height={500} 
            />
          </div>
        </div>
      )}

      {/* --- RENDER: FORM MODE --- */}
      {mode === 'form' && (
        <div className="max-w-md mx-auto animate-fade-in">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              className="border p-3 rounded text-black shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Applicant Name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <input
              className="border p-3 rounded text-black shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Phone Number"
              required
              value={formData.phoneno}
              onChange={(e) => setFormData({ ...formData, phoneno: e.target.value })}
            />
            <textarea
              className="border p-3 rounded text-black shadow-sm h-32 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Home Address"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
            <button
              type="submit"
              disabled={isLoading}
              className={`p-3 rounded text-white font-semibold transition-colors mt-2 ${
                isLoading
                  ? "bg-blue-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isLoading ? "Generating Preview..." : "Generate Preview"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
