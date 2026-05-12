"use client";

import { useEffect, useMemo, useState } from "react";
import { marked } from "marked";
import Prism from "prismjs";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-http";
import "prismjs/components/prism-json";
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-markdown";
import "prismjs/themes/prism-tomorrow.css";

const EMPTY_MARKDOWN = `# Your README preview will appear here

Generate a README on the home page, then open full preview.

- Copy to clipboard
- Download as README.md
- Share on X
`;

export default function PreviewPage() {
  const [markdown, setMarkdown] = useState(EMPTY_MARKDOWN);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("readmeforge-generated-readme");
    if (saved?.trim()) {
      queueMicrotask(() => setMarkdown(saved));
    }
  }, []);

  const previewHtml = useMemo(() => marked(markdown), [markdown]);

  useEffect(() => {
    Prism.highlightAll();
  }, [markdown]);

  const copyMarkdown = async () => {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const downloadMarkdown = () => {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "README.md";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const shareOnX = () => {
    const text = encodeURIComponent("I just generated an API README.md from an OpenAPI spec with ReadmeForge.");
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=https://hirenthakore.github.io/readmeforge/`, "_blank");
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-black/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <a href="/readmeforge/" className="text-sm text-indigo-300 hover:text-indigo-200">← Back to generator</a>
            <h1 className="mt-2 text-2xl font-bold">Generated README Preview</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-sm text-amber-200">Premium-ready export</span>
            <button onClick={copyMarkdown} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold hover:bg-indigo-700">
              {copied ? "Copied" : "Copy"}
            </button>
            <button onClick={downloadMarkdown} className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-semibold hover:bg-zinc-700">Download</button>
            <button onClick={shareOnX} className="rounded-lg bg-sky-500/10 px-4 py-2 text-sm font-semibold text-sky-300 hover:bg-sky-500/20">Share on X</button>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <article
          className="prose prose-invert max-w-none rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-2xl shadow-indigo-950/20"
          dangerouslySetInnerHTML={{ __html: previewHtml as string }}
        />
        <aside className="h-fit rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6">
          <h2 className="text-lg font-semibold">Markdown source</h2>
          <p className="mt-2 text-sm text-zinc-400">Editable export source for the generated README.</p>
          <textarea
            value={markdown}
            onChange={(event) => setMarkdown(event.target.value)}
            className="mt-4 h-[520px] w-full resize-none rounded-xl border border-zinc-800 bg-black/50 p-4 font-mono text-xs text-zinc-200 outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </aside>
      </section>
    </main>
  );
}
