/** @jsxImportSource react */
import { createRoot } from "react-dom/client";
import { useState, useEffect } from "react";
import { TableOfContents } from "./TableOfContents";

// Mobile TOC popup wrapper component
function MobileTOCWrapper() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if we're on mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1024);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!isMobile) return;

    // Add click handlers to article headings on mobile
    const articleContent = document.querySelector(".article-content");
    if (!articleContent) return;

    const headings = articleContent.querySelectorAll("h2, h3, h4");
    
    const handleHeadingClick = (e: Event) => {
      e.preventDefault();
      setIsOpen(true);
    };

    headings.forEach((heading) => {
      heading.addEventListener("click", handleHeadingClick);
      (heading as HTMLElement).style.cursor = "pointer";
    });

    return () => {
      headings.forEach((heading) => {
        heading.removeEventListener("click", handleHeadingClick);
        (heading as HTMLElement).style.cursor = "";
      });
    };
  }, [isMobile]);

  // Prevent body scroll when popup is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (isMobile) {
    return (
      <TableOfContents 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        isMobilePopup={true}
      />
    );
  }

  // Desktop: render normal TOC
  return <TableOfContents />;
}

// Hydrate the TableOfContents component
const container = document.getElementById("article-toc");
if (container) {
  const root = createRoot(container);
  root.render(<MobileTOCWrapper />);
}
