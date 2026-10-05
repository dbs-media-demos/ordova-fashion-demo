"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";

/**
 * Success animation: the garment folds itself (sleeves in, hem up), drops
 * into the box, the tissue closes, the lid comes down and a sticker with the
 * order number lands on top.
 */
export function FoldBox({ number }: { number: string }) {
  const svg = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(svg);
      const tl = gsap.timeline({ delay: 0.3, defaults: { ease: "power3.inOut" } });
      tl.set(q("#garment"), { transformOrigin: "50% 50%" })
        .fromTo(q("#garment"), { y: -18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" })
        .to(q("#sleeve-l"), { scaleX: -1, svgOrigin: "122 96", duration: 0.55 }, "+=0.25")
        .to(q("#sleeve-r"), { scaleX: -1, svgOrigin: "198 96", duration: 0.55 }, "<0.12")
        .to(q("#hem"), { scaleY: -1, svgOrigin: "160 138", duration: 0.6 }, "+=0.05")
        .to(q("#garment"), { y: 92, scale: 0.86, svgOrigin: "160 120", duration: 0.7, ease: "power2.in" }, "+=0.15")
        .to(q("#tissue-l"), { rotate: 0, svgOrigin: "92 196", duration: 0.5 }, "-=0.05")
        .to(q("#tissue-r"), { rotate: 0, svgOrigin: "228 196", duration: 0.5 }, "<0.08")
        .fromTo(q("#lid"), { y: -150, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: "back.out(1.2)" }, "+=0.05")
        .fromTo(q("#sticker"), { scale: 2.6, rotate: -40, opacity: 0, svgOrigin: "212 196" }, { scale: 1, rotate: -10, opacity: 1, duration: 0.5, ease: "back.out(2)" }, "+=0.1");
      if (prefersReducedMotion()) tl.progress(1);
    },
    { scope: svg },
  );

  return (
    <svg ref={svg} viewBox="0 0 320 290" className="h-auto w-full max-w-[30rem]" role="img" aria-label={`Your order ${number}, folded and boxed`}>
      {/* box back + inside */}
      <path d="M86 196h148v16H86z" fill="#c9b48f" />
      <path d="M92 196h136l-8-10H100z" fill="#b39c75" />
      {/* garment */}
      <g id="garment">
        <g id="sleeve-l">
          <path d="M122 96 94 108l10 30 18-8z" fill="#ece4d2" stroke="#151513" strokeWidth="1.5" strokeLinejoin="round" />
        </g>
        <g id="sleeve-r">
          <path d="m198 96 28 12-10 30-18-8z" fill="#ece4d2" stroke="#151513" strokeWidth="1.5" strokeLinejoin="round" />
        </g>
        <path d="M122 96c10-4 18-6 24-6 2 6 8 9 14 9s12-3 14-9c6 0 14 2 24 6v42h-76z" fill="#f4efe4" stroke="#151513" strokeWidth="1.5" strokeLinejoin="round" />
        <g id="hem">
          <path d="M122 138h76v40h-76z" fill="#f4efe4" stroke="#151513" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M160 140v36" stroke="#151513" strokeWidth="0.8" strokeDasharray="2 3" />
        </g>
        <path d="M160 99v39" stroke="#151513" strokeWidth="0.8" strokeDasharray="2 3" />
      </g>
      {/* tissue flaps */}
      <path id="tissue-l" d="M92 196 160 196 92 150z" fill="#fbfaf7" stroke="#d9d2c4" strokeWidth="1" transform="rotate(-70 92 196)" opacity="0.95" />
      <path id="tissue-r" d="M228 196 160 196 228 150z" fill="#fbfaf7" stroke="#d9d2c4" strokeWidth="1" transform="rotate(70 228 196)" opacity="0.95" />
      {/* box front */}
      <path d="M80 196h160v74a6 6 0 0 1-6 6H86a6 6 0 0 1-6-6z" fill="#d8c5a2" />
      <path d="M80 196h160v8H80z" fill="#c4ad86" />
      <text x="160" y="248" textAnchor="middle" fontFamily="var(--font-display)" fontWeight="800" fontSize="15" letterSpacing="2" fill="#151513" opacity="0.8">
        ORDOVA
      </text>
      {/* lid */}
      <g id="lid" opacity="0">
        <path d="M74 178h172a4 4 0 0 1 4 4v18H70v-18a4 4 0 0 1 4-4z" fill="#cbb791" />
        <path d="M70 196h180v8H70z" fill="#b8a27b" />
      </g>
      {/* sticker */}
      <g id="sticker" opacity="0">
        <circle cx="212" cy="196" r="30" fill="#2b36f0" />
        <circle cx="212" cy="196" r="25" fill="none" stroke="#f6f3ee" strokeWidth="0.8" strokeDasharray="2 2" />
        <text x="212" y="191" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="6.5" fill="#f6f3ee" letterSpacing="0.6">
          ORDER
        </text>
        <text x="212" y="203" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="7.5" fill="#f6f3ee">
          {number.replace("ORD-", "")}
        </text>
      </g>
    </svg>
  );
}
