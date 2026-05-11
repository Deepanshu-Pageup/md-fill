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
      <div
        className="min-h-screen px-4 py-8 sm:px-6 lg:px-8"
        style={{
          background:
            "radial-gradient(circle at top right, #fef3c7 0%, #f8fafc 40%, #e0f2fe 100%)",
          fontFamily: '"Manrope", "Segoe UI", sans-serif',
        }}
      >
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center rounded-3xl border border-slate-200/70 bg-white/90 p-5 shadow-xl backdrop-blur sm:p-8">
          <h1 className="mb-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Document Preview
          </h1>
          <p className="mb-6 text-sm text-slate-600 sm:text-base">
            Review your generated file before downloading it.
          </p>

        <iframe
          src={pdfUrl}
          className="mb-6 h-[65vh] w-full rounded-2xl border-2 border-slate-200 bg-white shadow-lg"
          title="PDF Preview"
        />
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <button
              onClick={handleDownload}
              className="rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-emerald-700"
            >
              Download PDF
            </button>
            <button
              onClick={handleReset}
              className="rounded-xl bg-slate-800 px-6 py-3 font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-slate-900"
            >
              Create Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================
  // UI: DASHBOARD (FORM OR EDITOR)
  // ============================
  return (
    <div
      className="min-h-screen px-4 py-8 sm:px-6 lg:px-8"
      data-color-mode="light"
      style={{
        background:
          "linear-gradient(155deg, #fff7ed 0%, #f8fafc 45%, #ecfeff 100%)",
        fontFamily: '"Manrope", "Segoe UI", sans-serif',
      }}
    >
      <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200/80 bg-white/85 p-5 shadow-xl backdrop-blur sm:p-8">
        <div className="mb-8 flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              HR PDF Studio
            </h1>
            <p className="mt-1 text-sm text-slate-600 sm:text-base">
              Generate polished applicant letters and edit reusable templates.
            </p>
          </div>
          <div className="inline-flex rounded-xl bg-slate-100 p-1">
            <button
              onClick={() => setMode("form")}
              className={`rounded-lg px-4 py-2 font-semibold transition-all ${
                mode === "form"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Generate PDF
            </button>
            <button
              onClick={() => setMode("editor")}
              className={`rounded-lg px-4 py-2 font-semibold transition-all ${
                mode === "editor"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Edit Template
            </button>
          </div>
        </div>

        {mode === "editor" && (
          <div className="animate-[fadeIn_.25s_ease-out]">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-600 sm:text-base">
                Available tags: <code>{"{{name}}"}</code>,{" "}
                <code>{"{{phoneno}}"}</code>, <code>{"{{address}}"}</code>
              </p>
              <button
                onClick={handleSaveTemplate}
                disabled={isLoading}
                className="rounded-xl bg-emerald-600 px-6 py-2.5 font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading ? "Saving..." : "Save to DB"}
              </button>
            </div>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <MDEditor
                value={templateContent}
                onChange={(val) => setTemplateContent(val || "")}
                height={520}
              />
            </div>
          </div>
        )}

        {mode === "form" && (
          <div className="mx-auto max-w-xl animate-[fadeIn_.25s_ease-out]">
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                placeholder="Applicant Name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <input
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                placeholder="Phone Number"
                required
                value={formData.phoneno}
                onChange={(e) =>
                  setFormData({ ...formData, phoneno: e.target.value })
                }
              />
              <textarea
                className="h-32 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                placeholder="Home Address"
                required
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full rounded-xl p-3.5 font-semibold text-white transition-all ${
                  isLoading
                    ? "cursor-not-allowed bg-cyan-300"
                    : "bg-cyan-600 hover:-translate-y-0.5 hover:bg-cyan-700"
                }`}
              >
                {isLoading ? "Generating Preview..." : "Generate Preview"}
              </button>
            </form>
          </div>
        )}
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
