"use client";

import { useState, useCallback } from "react";
import { parseOpenAPI, validateOpenAPI } from "@/lib/parser";
import { generateReadme, TEMPLATES, TemplateId } from "@/lib/templates";
import { marked } from "marked";

const SAMPLE_OPENAPI = `openapi: 3.0.3
info:
  title: Stripe Payments API
  description: A comprehensive API for processing payments, managing customers, and handling subscriptions.
  version: 1.0.0
  contact:
    name: Stripe Support
    email: support@stripe.com
    url: https://stripe.com/docs

servers:
  - url: https://api.stripe.com/v1
    description: Production

paths:
  /customers:
    get:
      summary: List all customers
      description: Returns a list of your customers. The customers are sorted by creation date, with the most recent customers appearing first.
      operationId: listCustomers
      parameters:
        - name: limit
          in: query
          description: A limit on the number of objects to be returned.
          schema:
            type: integer
            default: 10
        - name: email
          in: query
          description: Filter customers by email address.
          schema:
            type: string
      responses:
        '200':
          description: A list of customers
          content:
            application/json:
              schema:
                type: object
    post:
      summary: Create a customer
      description: Creates a new customer object.
      operationId: createCustomer
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                name:
                  type: string
                metadata:
                  type: object
      responses:
        '200':
          description: Customer created successfully

  /customers/{id}:
    get:
      summary: Retrieve a customer
      description: Retrieves the details of an existing customer.
      operationId: getCustomer
      parameters:
        - name: id
          in: path
          required: true
          description: The ID of the customer to retrieve.
          schema:
            type: string
      responses:
        '200':
          description: Customer details
        '404':
          description: Customer not found

  /charges:
    post:
      summary: Create a charge
      description: Creates a new charge object.
      operationId: createCharge
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                amount:
                  type: integer
                  description: Amount to charge in cents
                currency:
                  type: string
                  enum: [usd, eur, gbp]
                customer:
                  type: string
                description:
                  type: string
      responses:
        '200':
          description: Charge created successfully

components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: API Key
      description: Enter your API key in the format: Bearer <your_api_key>
`;

export default function Home() {
  const [openapiInput, setOpenapiInput] = useState<string>("");
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>("minimal-dark");
  const [generatedMarkdown, setGeneratedMarkdown] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = useCallback(() => {
    if (!openapiInput.trim()) {
      setError("Please paste an OpenAPI specification first.");
      setGeneratedMarkdown("");
      return;
    }

    setIsGenerating(true);
    setError("");

    try {
      const validation = validateOpenAPI(openapiInput);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      const parsed = parseOpenAPI(openapiInput);
      const markdown = generateReadme(parsed, selectedTemplate);
      setGeneratedMarkdown(markdown);
      window.localStorage.setItem("readmeforge-generated-readme", markdown);
    } catch (e) {
      setError((e as Error).message);
      setGeneratedMarkdown("");
    } finally {
      setIsGenerating(false);
    }
  }, [openapiInput, selectedTemplate]);

  const handleLoadSample = () => {
    setOpenapiInput(SAMPLE_OPENAPI);
    setError("");
  };

  const handleCopy = async () => {
    if (generatedMarkdown) {
      await navigator.clipboard.writeText(generatedMarkdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!generatedMarkdown) return;
    const blob = new Blob([generatedMarkdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "README.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShareX = () => {
    const text = encodeURIComponent(
      `Just generated a beautiful API README.md from my OpenAPI spec using ReadmeForge 🔥🚀 #API #OpenAPI #DevTools`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
  };

  const previewHtml = generatedMarkdown ? marked(generatedMarkdown) : "";

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              ReadmeForge
            </span>
          </div>
          <nav className="flex items-center gap-6">
            <a href="#templates" className="text-zinc-400 hover:text-white transition-colors text-sm">Templates</a>
            <a href="#pricing" className="text-zinc-400 hover:text-white transition-colors text-sm">Pricing</a>
            <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors">
              Get Started
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm mb-8">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Instant README generation from OpenAPI specs
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Turn your{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              OpenAPI spec
            </span>
            <br />
            into a beautiful README.md
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10">
            Paste your OpenAPI 3.x YAML or JSON specification and instantly generate
            stunning documentation with 5 professional templates.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => document.getElementById("editor")?.scrollIntoView({ behavior: "smooth" })}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/25"
            >
              Generate Now
            </button>
            <button
              onClick={handleLoadSample}
              className="px-8 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-xl transition-colors border border-zinc-700"
            >
              Load Sample Spec
            </button>
          </div>
        </div>
      </section>

      {/* Main Editor Section */}
      <section id="editor" className="flex-1 px-4 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left Panel - Input */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">OpenAPI Specification</h2>
                <span className="text-sm text-zinc-500">YAML or JSON</span>
              </div>
              <textarea
                value={openapiInput}
                onChange={(e) => setOpenapiInput(e.target.value)}
                placeholder="Paste your OpenAPI 3.x YAML or JSON specification here..."
                className="w-full h-96 p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-sm font-mono text-zinc-300 placeholder:text-zinc-600 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Template Selector */}
              <div id="templates" className="space-y-3">
                <h3 className="text-sm font-medium text-zinc-300">Choose Template</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {TEMPLATES.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template.id)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        selectedTemplate === template.id
                          ? "bg-indigo-500/10 border-indigo-500/50 ring-2 ring-indigo-500/50"
                          : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            selectedTemplate === template.id ? "bg-indigo-500" : "bg-zinc-600"
                          }`}
                        />
                        <span className="font-medium text-white text-sm">{template.name}</span>
                      </div>
                      <p className="text-xs text-zinc-500">{template.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-zinc-600 disabled:to-zinc-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/25 disabled:shadow-none flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Generate README
                  </>
                )}
              </button>
            </div>

            {/* Right Panel - Preview */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Preview</h2>
                {generatedMarkdown && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopy}
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      {copied ? (
                        <>
                          <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Copied!
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Copy
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleDownload}
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download
                    </button>
                    <a
                      href="/readmeforge/preview"
                      className="px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-sm rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      Full Preview
                    </a>
                    <button
                      onClick={handleShareX}
                      className="px-3 py-1.5 bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 text-[#1DA1F2] text-sm rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                      Share
                    </button>
                  </div>
                )}
              </div>
              
              {generatedMarkdown ? (
                <div
                  className="w-full h-[600px] p-6 bg-zinc-900 border border-zinc-800 rounded-xl overflow-auto prose prose-invert prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: previewHtml as string }}
                />
              ) : (
                <div className="w-full h-[600px] p-6 bg-zinc-900/50 border border-zinc-800 border-dashed rounded-xl flex flex-col items-center justify-center text-zinc-500">
                  <svg className="w-16 h-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-center">
                    Your generated README will appear here.<br />
                    Paste an OpenAPI spec and click Generate.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 border-t border-zinc-800">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Pay What You Want</h2>
            <p className="text-zinc-400 text-lg">
              Love it? Support the project. Otherwise, just use it for free.
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-8 text-center max-w-md mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/20 rounded-full text-indigo-300 text-sm mb-6">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Suggested: $9/month
            </div>
            
            <h3 className="text-2xl font-bold mb-2">ReadmeForge Pro</h3>
            <p className="text-zinc-400 mb-6">
              Unlimited README generations, all 5 templates, no watermarks.
            </p>
            
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 text-left">
                <svg className="w-5 h-5 text-indigo-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-zinc-300">Unlimited generations</span>
              </div>
              <div className="flex items-center gap-3 text-left">
                <svg className="w-5 h-5 text-indigo-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-zinc-300">All 5 premium templates</span>
              </div>
              <div className="flex items-center gap-3 text-left">
                <svg className="w-5 h-5 text-indigo-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-zinc-300">No watermarks</span>
              </div>
              <div className="flex items-center gap-3 text-left">
                <svg className="w-5 h-5 text-indigo-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-zinc-300">Priority support</span>
              </div>
            </div>
            
            <button className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/25">
              Coming Soon
            </button>
            
            <p className="text-xs text-zinc-500 mt-4">
              Basic usage is always free. No credit card required.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-zinc-500">
          <p>Built by{" "}
            <a href="https://twitter.com/tireddev" className="text-indigo-400 hover:text-indigo-300 transition-colors">
              @tireddev
            </a>
          </p>
          <p>Powered by OpenAPI 3.0</p>
        </div>
      </footer>
    </div>
  );
}
