import React, { useState, useEffect, useRef } from "react";

const MAX_OVERFLOW = 50;

export default function ElasticSlider({
  defaultValue = 50,
  startingValue = 0,
  maxValue = 100,
  className = "",
  isStepped = false,
  stepSize = 1,
  leftIcon = "-",
  rightIcon = "+",
  formatValue = (val) => `${Math.round(val)}`,
  onChange,
}) {
  const [value, setValue] = useState(defaultValue);
  const [region, setRegion] = useState("middle");
  const [clientX, setClientX] = useState(0);
  const [overflow, setOverflow] = useState(0);
  const [scale, setScale] = useState(1);
  const [leftIconScale, setLeftIconScale] = useState(1);
  const [rightIconScale, setRightIconScale] = useState(1);

  // States to hold bounding client dimensions to avoid accessing ref during render
  const [sliderWidth, setSliderWidth] = useState(200);
  const [sliderLeft, setSliderLeft] = useState(0);

  const sliderRef = useRef(null);
  const leftIconRef = useRef(null);
  const rightIconRef = useRef(null);

  const scaleValRef = useRef(1);
  const overflowValRef = useRef(0);
  const leftIconScaleValRef = useRef(1);
  const rightIconScaleValRef = useRef(1);
  const regionValRef = useRef("middle");

  const scaleAnimationRef = useRef(null);
  const overflowAnimationRef = useRef(null);
  const leftIconScaleAnimRef = useRef(null);
  const rightIconScaleAnimRef = useRef(null);

  const [prevDefaultValue, setPrevDefaultValue] = useState(defaultValue);
  if (defaultValue !== prevDefaultValue) {
    setPrevDefaultValue(defaultValue);
    setValue(defaultValue);
  }

  // Sync initial dimensions on mount
  useEffect(() => {
    if (sliderRef.current) {
      const { left, width } = sliderRef.current.getBoundingClientRect();
      setSliderLeft(left || 0);
      setSliderWidth(width || 200);
    }
  }, []);

  // Clean up animations on unmount
  useEffect(() => {
    const scaleAnim = scaleAnimationRef;
    const overflowAnim = overflowAnimationRef;
    const leftIconAnim = leftIconScaleAnimRef;
    const rightIconAnim = rightIconScaleAnimRef;
    return () => {
      if (scaleAnim.current) cancelAnimationFrame(scaleAnim.current);
      if (overflowAnim.current) cancelAnimationFrame(overflowAnim.current);
      if (leftIconAnim.current) cancelAnimationFrame(leftIconAnim.current);
      if (rightIconAnim.current) cancelAnimationFrame(rightIconAnim.current);
    };
  }, []);

  const updateScale = (val) => {
    scaleValRef.current = val;
    setScale(val);
  };
  const updateOverflow = (val) => {
    overflowValRef.current = val;
    setOverflow(val);
  };
  const updateLeftIconScale = (val) => {
    leftIconScaleValRef.current = val;
    setLeftIconScale(val);
  };
  const updateRightIconScale = (val) => {
    rightIconScaleValRef.current = val;
    setRightIconScale(val);
  };

  const updateRegion = (newRegion) => {
    const oldRegion = regionValRef.current;
    if (newRegion !== oldRegion) {
      regionValRef.current = newRegion;
      setRegion(newRegion);

      if (newRegion === "left") {
        animateIconScale(
          leftIconScaleValRef.current,
          updateLeftIconScale,
          leftIconScaleAnimRef,
          true,
        );
      } else if (newRegion === "right") {
        animateIconScale(
          rightIconScaleValRef.current,
          updateRightIconScale,
          rightIconScaleAnimRef,
          true,
        );
      }
    }
  };

  const decay = (inputValue, max) => {
    if (max === 0) return 0;
    const entry = inputValue / max;
    const sigmoid = 2 * (1 / (1 + Math.exp(-entry)) - 0.5);
    return sigmoid * max;
  };

  const animate = (start, to, setValueFn, animRef, options = {}) => {
    const { type = "tween", bounce = 0, duration = 0.3 } = options;

    if (animRef.current) {
      cancelAnimationFrame(animRef.current);
    }

    if (type === "spring") {
      animRef.current = animateSpring(start, to, setValueFn, animRef, bounce, duration);
    } else {
      animRef.current = animateValue(start, to, setValueFn, animRef, duration);
    }
    return animRef.current;
  };

  const animateValue = (start, to, setValueFn, animRef, duration = 300) => {
    const diff = to - start;
    const startTime = performance.now();

    const animateFrame = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = start + diff * easeOut;
      setValueFn(currentValue);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animateFrame);
      } else {
        animRef.current = null;
      }
    };

    return requestAnimationFrame(animateFrame);
  };

  const animateSpring = (start, to, setValueFn, animRef, bounce = 0.5, duration = 600) => {
    const startTime = performance.now();

    const mass = 1;
    const stiffness = 170;
    const damping = 26 * (1 - bounce);

    const dampingRatio = damping / (2 * Math.sqrt(mass * stiffness));
    const angularFreq = Math.sqrt(stiffness / mass);
    const dampedFreq = angularFreq * Math.sqrt(1 - dampingRatio * dampingRatio);

    const animateFrame = (currentTime) => {
      const elapsed = currentTime - startTime;
      const t = elapsed / 1000;

      let displacement;

      if (dampingRatio < 1) {
        const envelope = Math.exp(-dampingRatio * angularFreq * t);
        const cos = Math.cos(dampedFreq * t);
        const sin = Math.sin(dampedFreq * t);

        displacement = envelope * (cos + ((dampingRatio * angularFreq) / dampedFreq) * sin);
      } else {
        displacement = Math.exp(-angularFreq * t);
      }

      const currentValue = to + (start - to) * displacement;
      setValueFn(currentValue);

      const velocity = Math.abs(currentValue - to);
      const isSettled = velocity < 0.01 && elapsed > 100;

      if (!isSettled && elapsed < duration * 3) {
        animRef.current = requestAnimationFrame(animateFrame);
      } else {
        setValueFn(to);
        animRef.current = null;
      }
    };

    return requestAnimationFrame(animateFrame);
  };

  const animateIconScale = (startVal, setValueFn, animRef, isActive) => {
    if (isActive) {
      animate(startVal, 1.4, setValueFn, animRef, { duration: 125 });
      setTimeout(() => {
        animate(1.4, 1, setValueFn, animRef, { duration: 125 });
      }, 125);
    } else {
      animate(startVal, 1, setValueFn, animRef, { duration: 250 });
    }
  };

  const handlePointerMove = (e) => {
    if (e.buttons > 0 && sliderRef.current) {
      const { left, right, width } = sliderRef.current.getBoundingClientRect();
      setSliderWidth(width || 200);
      setSliderLeft(left || 0);

      let newValue = startingValue + ((e.clientX - left) / width) * (maxValue - startingValue);

      if (isStepped) {
        newValue = Math.round(newValue / stepSize) * stepSize;
      }

      newValue = Math.min(Math.max(newValue, startingValue), maxValue);
      setValue(newValue);
      onChange?.(newValue);

      setClientX(e.clientX);

      let newRegion;
      let offset;
      if (e.clientX < left) {
        newRegion = "left";
        offset = left - e.clientX;
      } else if (e.clientX > right) {
        newRegion = "right";
        offset = e.clientX - right;
      } else {
        newRegion = "middle";
        offset = 0;
      }

      updateRegion(newRegion);
      const targetOverflow = decay(offset, MAX_OVERFLOW);
      updateOverflow(targetOverflow);
    }
  };

  const handlePointerDown = (e) => {
    handlePointerMove(e);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerUp = () => {
    animate(overflowValRef.current, 0, updateOverflow, overflowAnimationRef, {
      type: "spring",
      bounce: 0.4,
      duration: 500,
    });
  };

  const handleMouseEnter = () => {
    animate(scaleValRef.current, 1.2, updateScale, scaleAnimationRef, { duration: 200 });
  };

  const handleMouseLeave = () => {
    animate(scaleValRef.current, 1, updateScale, scaleAnimationRef, { duration: 200 });
  };

  const handleTouchStart = () => {
    animate(scaleValRef.current, 1.2, updateScale, scaleAnimationRef, { duration: 200 });
  };

  const handleTouchEnd = () => {
    animate(scaleValRef.current, 1, updateScale, scaleAnimationRef, { duration: 200 });
  };

  const totalRange = maxValue - startingValue;
  const rangePercentage = totalRange === 0 ? 0 : ((value - startingValue) / totalRange) * 100;

  const sliderScaleX = 1 + overflow / sliderWidth;
  const sliderScaleY = 1 + (overflow / MAX_OVERFLOW) * (0.8 - 1);
  const transformOrigin = clientX < sliderLeft + sliderWidth / 2 ? "right" : "left";

  const tScale = (scale - 1) / (1.2 - 1);
  const sliderHeight = 6 + tScale * (12 - 6);
  const sliderMarginTop = 0 + tScale * (-3 - 0);
  const sliderMarginBottom = 0 + tScale * (-3 - 0);
  const sliderOpacity = 0.7 + tScale * (1 - 0.7);

  const leftIconTranslateX = region === "left" ? -overflow / scale : 0;
  const rightIconTranslateX = region === "right" ? overflow / scale : 0;

  const renderIcon = (iconInput, fallback) => {
    if (!iconInput) return <span>{fallback}</span>;
    if (typeof iconInput === "function" || React.isValidElement(iconInput)) {
      const IconComp = iconInput;
      return typeof IconComp === "function" ? <IconComp /> : IconComp;
    }
    return <span>{iconInput}</span>;
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-4 w-full relative ${className}`}>
      <div
        className="flex w-full touch-none select-none items-center justify-center gap-4"
        style={{
          transform: `scale(${scale})`,
          opacity: sliderOpacity,
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          ref={leftIconRef}
          style={{
            transform: `translateX(${leftIconTranslateX}px) scale(${leftIconScale})`,
          }}
          className="transition-transform duration-200 ease-out flex items-center justify-center text-primary/80 font-bold select-none"
        >
          {renderIcon(leftIcon, "-")}
        </div>

        <div
          ref={sliderRef}
          className="relative flex w-full max-w-xs flex-grow cursor-grab active:cursor-grabbing touch-none select-none items-center py-4"
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
        >
          <div
            style={{
              transform: `scaleX(${sliderScaleX}) scaleY(${sliderScaleY})`,
              transformOrigin: transformOrigin,
              height: `${sliderHeight}px`,
              marginTop: `${sliderMarginTop}px`,
              marginBottom: `${sliderMarginBottom}px`,
            }}
            className="flex flex-grow"
          >
            <div className="relative h-full flex-grow overflow-hidden rounded-full bg-outline/40">
              <div
                className="absolute h-full bg-primary rounded-full shadow-[0_0_8px_#00FF41]"
                style={{ width: `${rangePercentage}%` }}
              />
            </div>
          </div>
        </div>

        <div
          ref={rightIconRef}
          style={{
            transform: `translateX(${rightIconTranslateX}px) scale(${rightIconScale})`,
          }}
          className="transition-transform duration-200 ease-out flex items-center justify-center text-primary/80 font-bold select-none"
        >
          {renderIcon(rightIcon, "+")}
        </div>
      </div>

      <p className="absolute text-primary/80 transform -translate-y-6 font-bold tracking-widest text-[11px]">
        {formatValue(value)}
      </p>
    </div>
  );
}
