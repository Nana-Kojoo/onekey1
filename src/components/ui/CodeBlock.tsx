'use client';

import { useState } from 'react';
import { highlight } from '@/lib/utils';
import { CheckIcon, CopyIcon } from '@/components/ui/Icons';

interface CodeBlockProps {
  code: string;
}

export function CodeBlock({ code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="code-wrap">
      <div
        className="code-block"
        dangerouslySetInnerHTML={{ __html: highlight(code) }}
      />
      <button className="copy-btn" onClick={handleCopy}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          {copied ? <CheckIcon size={12} /> : <CopyIcon size={12} />}
          {copied ? 'Copied' : 'Copy'}
        </span>
      </button>
    </div>
  );
}
