/** @jsxImportSource react */
import { useState, useEffect, useRef } from "react";
import styles from "./TableOfContents.module.scss";

interface Heading {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Extract headings from article content
    const articleContent = document.querySelector(".article-content");
    if (!articleContent) return;

    const headingElements = articleContent.querySelectorAll("h2, h3, h4");
    const headingsData: Heading[] = [];

    headingElements.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1));
      const text = heading.textContent || "";
      
      // Use existing id or generate from index (don't modify DOM)
      const id = heading.id || `heading-${index}`;

      headingsData.push({ id, text, level });
    });

    setHeadings(headingsData);

    // Set up intersection observer for active heading detection
    const observerOptions = {
      rootMargin: "-20% 0px -35% 0px",
      threshold: 0,
    };

    const intersectingHeadings = new Set<string>();

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          intersectingHeadings.add(entry.target.id);
        } else {
          intersectingHeadings.delete(entry.target.id);
        }
      });
      
      // Set the first intersecting heading as active
      if (intersectingHeadings.size > 0) {
        const firstIntersecting = Array.from(headingElements).find(
          (h) => intersectingHeadings.has(h.id)
        );
        if (firstIntersecting) {
          setActiveId(firstIntersecting.id);
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

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (headings.length === 0) {
    return null;
  }

  return (
    <nav className={styles.toc} aria-label="Table of contents">
      <div className={styles.tocContainer}>
        {headings.map((heading) => (
          <button
            key={heading.id}
            onClick={() => handleClick(heading.id)}
            className={`${styles.tocItem} ${styles[`level${heading.level}`]} ${
              activeId === heading.id ? styles.active : ""
            }`}
            aria-current={activeId === heading.id ? "location" : undefined}
          >
            <span className={styles.tocLine}></span>
          </button>
        ))}
      </div>
    </nav>
  );
}
