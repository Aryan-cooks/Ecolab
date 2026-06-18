import { useEffect, useState, useRef, useMemo } from "react";
import { gsap } from "gsap";

export default function TextType({
  text,
  as: ElementTag = "div",
  typingSpeed = 50,
  initialDelay = 0,
  pauseDuration = 300,
  deletingSpeed = 30,
  loop = true,
  className = "",
  showCursor = true,
  hideCursorWhileTyping = false,
  cursorCharacter = "|",
  cursorBlinkDuration = 0.5,
  cursorClassName = "",
  textColors = [],
  variableSpeed,
  onSentenceComplete,
  startOnVisible = false,
  reverseMode = false,
  ...props
}) {
  const [displayedText, setDisplayText] = useState("");
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(!startOnVisible);

  const cursorRef = useRef(null);
  const containerRef = useRef(null);
  const hasFiredComplete = useRef(false);

  const textArray = useMemo(() => {
    return Array.isArray(text) ? text : [text];
  }, [text]);

  const getCurrentTextColor = () => {
    if (!textColors || !textColors.length) return "#ffffff";
    return textColors[currentTextIndex % textColors.length];
  };

  // Capture callback in ref to prevent unstable parent function references from restarting animation
  const onSentenceCompleteRef = useRef(onSentenceComplete);
  useEffect(() => {
    onSentenceCompleteRef.current = onSentenceComplete;
  }, [onSentenceComplete]);

  // Handle visibility tracking
  useEffect(() => {
    if (!startOnVisible) return;
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 },
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [startOnVisible]);

  // Cursor blink animation
  useEffect(() => {
    if (!showCursor) return;
    const cursor = cursorRef.current;
    if (!cursor) return;

    gsap.set(cursor, { opacity: 1 });
    const anim = gsap.to(cursor, {
      opacity: 0,
      duration: cursorBlinkDuration,
      repeat: -1,
      yoyo: true,
      ease: "power2.inOut",
    });

    return () => {
      anim.kill();
    };
  }, [showCursor, cursorBlinkDuration]);

  // Extract variableSpeed values to prevent unstable object references from restarting animation
  const variableSpeedMin = variableSpeed?.min;
  const variableSpeedMax = variableSpeed?.max;

  // Main typing state loop
  useEffect(() => {
    if (!isVisible) return;

    let timeoutId;
    const currentText = textArray[currentTextIndex] || "";
    const processedText = reverseMode ? currentText.split("").reverse().join("") : currentText;

    const executeTypingAnimation = () => {
      if (isDeleting) {
        if (displayedText === "") {
          timeoutId = setTimeout(() => {
            setIsDeleting(false);
            if (currentTextIndex === textArray.length - 1 && !loop) {
              return;
            }
            onSentenceCompleteRef.current?.(textArray[currentTextIndex], currentTextIndex);
            setCurrentTextIndex((prevIndex) => (prevIndex + 1) % textArray.length);
            setCurrentCharIndex(0);
          }, pauseDuration);
        } else {
          timeoutId = setTimeout(() => {
            setDisplayText((prev) => prev.slice(0, -1));
          }, deletingSpeed);
        }
      } else {
        if (currentCharIndex < processedText.length) {
          const speed =
            variableSpeedMin !== undefined && variableSpeedMax !== undefined
              ? Math.random() * (variableSpeedMax - variableSpeedMin) + variableSpeedMin
              : typingSpeed;
          timeoutId = setTimeout(() => {
            setDisplayText((prev) => prev + processedText[currentCharIndex]);
            setCurrentCharIndex((prev) => prev + 1);
          }, speed);
        } else if (loop || currentTextIndex < textArray.length - 1) {
          timeoutId = setTimeout(() => {
            setIsDeleting(true);
          }, pauseDuration);
        } else {
          if (!hasFiredComplete.current) {
            hasFiredComplete.current = true;
            timeoutId = setTimeout(() => {
              onSentenceCompleteRef.current?.(textArray[currentTextIndex], currentTextIndex);
            }, pauseDuration);
          }
        }
      }
    };

    if (currentCharIndex === 0 && !isDeleting && displayedText === "") {
      hasFiredComplete.current = false;
      timeoutId = setTimeout(() => {
        executeTypingAnimation();
      }, initialDelay);
    } else {
      executeTypingAnimation();
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [
    displayedText,
    currentCharIndex,
    isDeleting,
    isVisible,
    currentTextIndex,
    textArray,
    initialDelay,
    typingSpeed,
    deletingSpeed,
    pauseDuration,
    loop,
    reverseMode,
    variableSpeedMin,
    variableSpeedMax,
  ]);

  const showCursorNode =
    showCursor &&
    (!hideCursorWhileTyping ||
      (currentCharIndex >= (textArray[currentTextIndex]?.length || 0) && !isDeleting));

  return (
    <ElementTag
      ref={containerRef}
      className={`inline-block whitespace-pre-wrap tracking-tight ${className}`}
      {...props}
    >
      <span className="inline" style={{ color: getCurrentTextColor() }}>
        {displayedText}
      </span>
      {showCursorNode && (
        <span ref={cursorRef} className={`ml-1 inline-block opacity-100 ${cursorClassName}`}>
          {cursorCharacter}
        </span>
      )}
    </ElementTag>
  );
}
