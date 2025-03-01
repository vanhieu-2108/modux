Modux.elements = [];

function Modux(options = {}) {
  this.opt = Object.assign(
    {
      destroyOnClose: true,
      footer: false,
      cssClass: [],
      closeMethods: ["button", "overlay", "escape"],
    },
    options
  );
  this.template = document.querySelector(`#${this.opt.templateId}`);
  if (!this.template) {
    console.error(`Template with id ${this.opt.templateId} not found`);
    return;
  }
  const { closeMethods } = this.opt;
  this._allowBackdropClose = closeMethods.includes("overlay");
  this._allowEscapeClose = closeMethods.includes("escape");
  this._allowButtonClose = closeMethods.includes("button");
  this._footerButtons = [];
  this._handleEscapeKey = this._handleEscapeKey.bind(this);
}

Modux.prototype._build = function () {
  const content = this.template.content.cloneNode(true);
  // Create Modal elements
  this._backdrop = document.createElement("div");
  this._backdrop.className = "modal-backdrop";
  const container = document.createElement("div");
  container.className = "modal-container";
  this.opt.cssClass.forEach((c) => {
    if (typeof c === "string") container.classList.add(c);
  });
  if (this._allowButtonClose) {
    const closeBtn = this._createButton("&times;", "modal-close", () => {
      this.close();
    });
    container.append(closeBtn);
  }

  const modalContent = document.createElement("div");
  modalContent.className = "modal-content";

  // Append elements to the DOM
  modalContent.append(content);
  this._backdrop.append(container);
  container.append(modalContent);

  if (this.opt.footer) {
    this._modalFooter = document.createElement("div");
    this._modalFooter.className = "modal-footer";
    this._renderFooterContent();
    this._renderFooterButtons();
    container.append(this._modalFooter);
  }

  document.body.append(this._backdrop);
};

Modux.prototype.setFooterContent = function (html) {
  this._footerContent = html;
  this._renderFooterContent();
};

Modux.prototype.addFooterButton = function (title, className, callback) {
  const button = this._createButton(title, className, callback);
  this._footerButtons.push(button);
  this._renderFooterButtons();
};

Modux.prototype._renderFooterButtons = function () {
  if (this._modalFooter && this._footerContent) {
    this._footerButtons.forEach((button) => {
      this._modalFooter.append(button);
    });
  }
};

Modux.prototype._renderFooterContent = function () {
  if (this._modalFooter) {
    this._modalFooter.innerHTML = this._footerContent;
  }
};

Modux.prototype._createButton = function (title, className, callback) {
  const button = document.createElement("button");
  button.className = className;
  button.innerHTML = title;
  button.onclick = callback;
  return button;
};

Modux.prototype.open = function () {
  Modal.elements.push(this);
  if (!this._backdrop) {
    this._build();
  }
  setTimeout(() => {
    this._backdrop.classList.add("show");
  }, 0);

  // Disable scrolling
  document.body.classList.add("no-scroll");
  document.body.style.paddingRight = `${this._getScrollbarWidth()}px`;

  // Attach event listeners

  if (this._allowBackdropClose) {
    this._backdrop.onclick = (e) => {
      if (e.target === this._backdrop) {
        this.close();
      }
    };
  }

  if (this._allowEscapeClose) {
    document.addEventListener("keydown", this._handleEscapeKey);
  }
  this._onTransitionEnd(this.opt.onOpen);
  return this._backdrop;
};

Modux.prototype._handleEscapeKey = function (e) {
  const lastModal = Modal.elements[Modal.elements.length - 1];
  if (e.key === "Escape" && this === lastModal) {
    this.close();
  }
};

Modux.prototype._onTransitionEnd = function (callback) {
  this._backdrop.ontransitionend = (e) => {
    if (e.propertyName !== "transform") return;
    if (typeof callback === "function") callback();
  };
};

Modux.prototype.close = function (destroy = this.opt.destroyOnClose) {
  Modal.elements.pop();
  this._backdrop.classList.remove("show");
  if (this._allowBackdropClose) {
    document.removeEventListener("keydown", this._handleEscapeKey);
  }
  this._onTransitionEnd(() => {
    if (destroy && this._backdrop) {
      this._backdrop.remove();
      this._backdrop = null;
      this._modalFooter = null;
    }
    if (!Modal.elements.length) {
      document.body.classList.remove("no-scroll");
      document.body.style.paddingRight = "";
    }
    if (typeof this.opt.onClose === "function") this.opt.onClose();
  });
};

Modux.prototype.destroy = function () {
  this.close(true);
};

Modux.prototype._getScrollbarWidth = function () {
  if (this._scrollbarWidth) return this._sfunctioncrollbarWi;
  const div = document.createElement("div");
  Object.assign(div.style, {
    overflowY: "scroll",
    position: "absolute",
    top: "-9999px",
  });
  document.body.append(div);
  this._scrollbarWidth = div.offsetWidth - div.clientWidth;
  document.body.removeChild(div);
  return this._scrollbarWidth;
};
