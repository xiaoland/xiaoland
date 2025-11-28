/** @jsxImportSource react */
import { useState, useEffect, useRef } from "react";
import styles from "./TableOfContents.module.scss";

interface Heading {
  id: string;
  text: string;
  level: number;
  element: Element;
}

interface TableOfContentsProps {
  isOpen?: boolean;
  onClose?: () => void;
  isMobilePopup?: boolean;
}

// Generate a URL-friendly slug from text
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s]+/g, "-")
    .replace(/[^\w\u4e00-\u9fa5-]/g, "") // Keep Chinese characters, alphanumeric, and hyphens
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function TableOfContents({ isOpen = true, onClose, isMobilePopup = false }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isScrollingRef = useRef(false);

  useEffect(() => {
    // Extract headings from article content
    const articleContent = document.querySelector(".article-content");
    if (!articleContent) return;

    const headingElements = articleContent.querySelectorAll("h2, h3, h4");
    const headingsData: Heading[] = [];
    const usedIds = new Set<string>();

    headingElements.forEach((heading) => {
      const level = parseInt(heading.tagName.charAt(1));
      const text = heading.textContent || "";
      
      // Generate a unique slug-based ID
      let baseId = heading.id || generateSlug(text);
      let id = baseId;
      let counter = 1;
      
      // Ensure unique ID
      while (usedIds.has(id)) {
        id = `${baseId}-${counter}`;
        counter++;
      }
      usedIds.add(id);
      
      // Assign ID to the heading element in DOM for fragment navigation
      if (!heading.id) {
        heading.id = id;
      }

      headingsData.push({ id, text, level, element: heading });
    });

    setHeadings(headingsData);

    // Handle initial hash on page load
    const initialHash = window.location.hash.slice(1);
    if (initialHash) {
      const targetHeading = headingsData.find(h => h.id === initialHash);
      if (targetHeading) {
        // Small delay to ensure DOM is ready
        setTimeout(() => {
          targetHeading.element.scrollIntoView({ behavior: "smooth", block: "start" });
          setActiveId(initialHash);
        }, 100);
      }
    }

    // Set up intersection observer for active heading detection
    const observerOptions = {
      rootMargin: "-20% 0px -35% 0px",
      threshold: 0,
    };

    const intersectingHeadings = new Set<Element>();

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          intersectingHeadings.add(entry.target);
        } else {
          intersectingHeadings.delete(entry.target);
        }
      });
      
      // Set the first intersecting heading as active using headingsData
      if (intersectingHeadings.size > 0) {
        const firstIntersecting = headingsData.find(
          (h) => intersectingHeadings.has(h.element)
        );
        if (firstIntersecting) {
          setActiveId(firstIntersecting.id);
          // Update URL hash without triggering scroll (only if not programmatically scrolling)
          if (!isScrollingRef.current) {
            const newUrl = `${window.location.pathname}#${firstIntersecting.id}`;
            window.history.replaceState(null, "", newUrl);
          }
        }
      }
    }, observerOptions);

    headingElements.forEach((heading) => {
      observerRef.current?.observe(heading);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  const handleClick = (heading: Heading) => {
    // Mark that we're programmatically scrolling
    isScrollingRef.current = true;
    
    // Update URL hash
    const newUrl = `${window.location.pathname}#${heading.id}`;
    window.history.pushState(null, "", newUrl);
    
    // Scroll to heading
    heading.element.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveId(heading.id);
    
    // Reset scrolling flag after animation completes
    setTimeout(() => {
      isScrollingRef.current = false;
    }, 1000);
    
    if (isMobilePopup && onClose) {
      onClose();
    }
  };

  if (headings.length === 0) {
    return null;
  }

  if (isMobilePopup) {
    if (!isOpen) return null;
    
    return (
      <div className={styles.mobileOverlay} onClick={onClose}>
        <nav 
          className={styles.mobilePopup} 
          aria-label="Table of contents"
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.mobileHeader}>
            <span className={styles.mobileTitle}>目录</span>
            <button 
              className={styles.closeButton} 
              onClick={onClose}
              aria-label="Close table of contents"
            >
              ×
            </button>
          </div>
          <div className={styles.mobileContent}>
            {headings.map((heading) => (
              <button
                key={heading.id}
                onClick={() => handleClick(heading)}
                className={`${styles.mobileItem} ${styles[`mobileLevel${heading.level}`]} ${
                  activeId === heading.id ? styles.mobileActive : ""
                }`}
                aria-current={activeId === heading.id ? "location" : undefined}
              >
                {heading.text}
              </button>
            ))}
          </div>
        </nav>
      </div>
    );
  }

  return (
    <nav className={styles.toc} aria-label="Table of contents">
      <div className={styles.tocContainer}>
        {headings.map((heading) => (
          <button
            key={heading.id}
            onClick={() => handleClick(heading)}
            className={`${styles.tocItem} ${styles[`level${heading.level}`]} ${
              activeId === heading.id ? styles.active : ""
            }`}
            aria-current={activeId === heading.id ? "location" : undefined}
          >
            <span className={styles.tocIndicator}>{heading.text}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
