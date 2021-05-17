import requestRedraw from "./requestRedraw";
import * as data from "./data";

if (typeof HTMLElement !== "function") {
  throw new Error(
    "d3fc-element depends on Custom Elements (v1). Make sure that you load a polyfill in older browsers. See README."
  );
}

const addResizeObserver = (element) => {
  if (element.__resizeObserver__ != null) {
    return;
  }

  element.__resizeObserver__ = new ResizeObserver((entries) => {
    const entry = entries.find((entry) => entry.target === element);

    data.set(element, {
      width: entry.devicePixelContentBoxSize[0].inlineSize,
      height: entry.devicePixelContentBoxSize[0].blockSize,
    });
  });

  element.__resizeObserver__.observe(element, {
    box: ["device-pixel-content-box"],
  });
};

const removeResizeObserver = (element) => {
  if (element.__resizeObserver__ == null) {
    return;
  }
  element.__resizeObserver__.unobserve(element);
  element.__resizeObserver__ = null;
};

const addMeasureListener = (element) => {
  if (element.__measureListener__ != null) {
    return;
  }
  element.__measureListener__ = (event) =>
    element.setMeasurements(event.detail);

  element.addEventListener("measure", element.__measureListener__);
};

const removeMeasureListener = (element) => {
  if (element.__measureListener__ == null) {
    return;
  }
  element.removeEventListener("measure", element.__measureListener__);
  element.__measureListener__ = null;
};

export default (createNode, applyMeasurements) =>
  class extends HTMLElement {
    static get observedAttributes() {
      return ["use-device-pixel-ratio"];
    }

    attributeChangedCallback(name) {
      switch (name) {
        case "use-device-pixel-ratio":
          this.requestRedraw();
          break;
      }
    }

    connectedCallback() {
      console.log("Connected");
      if (this.childNodes.length === 0) {
        this.appendChild(createNode());
      }

      addMeasureListener(this);
      addResizeObserver(this);
    }

    disconnectedCallback() {
      removeMeasureListener(this);
      removeResizeObserver(this);
    }

    setMeasurements({ width, height }) {
      const {
        childNodes: [node, ...other],
      } = this;
      if (other.length > 0) {
        throw new Error(
          "A d3fc-svg/canvas element must only contain a single svg/canvas element."
        );
      }
      applyMeasurements(this, node, { width, height });
    }

    get useDevicePixelRatio() {
      return (
        this.hasAttribute("use-device-pixel-ratio") &&
        this.getAttribute("use-device-pixel-ratio") !== "false"
      );
    }

    set useDevicePixelRatio(useDevicePixelRatio) {
      if (useDevicePixelRatio && !this.useDevicePixelRatio) {
        this.setAttribute("use-device-pixel-ratio", "");
      } else if (!useDevicePixelRatio && this.useDevicePixelRatio) {
        this.removeAttribute("use-device-pixel-ratio");
      }
      this.requestRedraw();
    }

    requestRedraw() {
      requestRedraw(this);
    }
  };
