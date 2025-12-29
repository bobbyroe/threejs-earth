import React, { useEffect, useRef } from "react";
import "./app.css";

const e = React.createElement;

function useFadeUpObserver(rootRef) {
  useEffect(() => {
    const rootElement = rootRef.current;
    if (!rootElement) return;

    const fadeTargets = Array.from(
      rootElement.querySelectorAll(".fade-up")
    );
    if (!fadeTargets.length) return;

    const revealTarget = (target) => {
      if (target.classList.contains("is-in")) return;
      requestAnimationFrame(() => {
        target.classList.add("is-in");
      });
    };

    const resetTarget = (target) => {
      if (!target.classList.contains("is-in")) return;
      target.classList.remove("is-in");
      void target.getBoundingClientRect();
    };

    fadeTargets.forEach((target) => {
      target.classList.remove("is-in");
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const target = entry.target;

          if (entry.isIntersecting) {
            revealTarget(target);
            return;
          }

          if (entry.intersectionRatio > 0) {
            return;
          }

          const rootBounds = entry.rootBounds;
          const fullyAbove = rootBounds
            ? entry.boundingClientRect.bottom <= rootBounds.top
            : entry.boundingClientRect.bottom <= 0;
          const fullyBelow = rootBounds
            ? entry.boundingClientRect.top >= rootBounds.bottom
            : entry.boundingClientRect.top >= (typeof window !== "undefined" ? window.innerHeight : 0);

          if (fullyAbove || fullyBelow) {
            resetTarget(target);
          }
        });
      },
      {
        root: rootElement,
        rootMargin: "0px 0px -10% 0px",
        threshold: 0.15,
      }
    );

    fadeTargets.forEach((target) => observer.observe(target));

    return () => {
      observer.disconnect();
    };
  }, []);
}

function MissionLabel({ text }) {
  return e("p", { className: "overlay__missionLabel" }, text);
}

function MissionCopy({ text }) {
  return e("p", { className: "overlay__missionText" }, text);
}

function CtaButton({ label, href = "mailto:david@abundance.company", onClick, delay = "0s" }) {
  return e(
    "a",
    {
      className: "overlay__cta fade-up",
      href,
      rel: "noopener noreferrer",
      onClick,
      style: { "--fade-delay": delay },
    },
    label
  );
}


function MissionSection({ label, copy, delay = "0s" }) {
  return e(
    "section",
    { className: "overlay__mission fade-up", style: { "--fade-delay": delay } },
    e(MissionLabel, { text: label }),
    e(MissionCopy, { text: copy })
  );
}

function OverlayTitle() {
  return e(
    "div",
    {
      className: "overlay__hero fade-up",
      style: { "--fade-delay": "0s", "--fade-duration": "640ms" },
    },
    e("h1", { className: "overlay__title" }, "Abundance")
  );
}


function OverlayContent() {
  const contentRef = useRef(null);
  useFadeUpObserver(contentRef);

  return e(
    "div",
    { className: "overlay__content", ref: contentRef },
    e(OverlayTitle),
    e("div", { className: "overlay__spacer" }),
    e(
      "div",
      { className: "overlay__stack fade-up", style: { "--fade-delay": "0.05s" } },
      e(MissionSection, {
        label: "Our Mission",
        copy: "To create Abundance for all",
        delay: "0.15s",
      }),
      e(CtaButton, { label: "Contact Us", href: "mailto:david@abundance.company", delay: "0.25s" })
    )
  );
}


function App() {
  return e("div", { className: "overlay" }, e(OverlayContent));
}

export default App;

