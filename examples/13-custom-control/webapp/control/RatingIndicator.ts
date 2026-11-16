import Control from "sap/ui/core/Control";
import Element from "sap/ui/core/Element";
import RenderManager from "sap/ui/core/RenderManager";

/**
 * A CUSTOM control: a five-star rating widget.
 *
 * The four building blocks every custom control has:
 * - metadata:  properties (value, max) + events (rate)
 * - renderer:  pure DOM writing - no event wiring, no state (apiVersion 2)
 * - onclick:   the framework dispatches browser clicks to on<event>
 *              handlers on the control; the renderer's data-rate attribute
 *              tells us which star was hit
 * - two-way:   setProperty fires the property change, so a bound model is
 *              written back automatically (the same contract sap.m's own
 *              controls follow)
 *
 * Classic Control.extend style: the methods in the settings object are
 * copied onto the prototype (the ES-class decorator pipeline is not set
 * up in this repo - the classic form needs nothing extra).
 */
const RatingIndicator = Control.extend("learn.rating.control.RatingIndicator", {

	metadata: {
		library: "learn.rating",
		properties: {
			value: { type: "int", defaultValue: 0 },
			max: { type: "int", defaultValue: 5 },
			// A custom control cannot reach the host's i18n bundle itself -
			// the view binds this text, the renderer turns it into aria-label.
			labelText: { type: "string", defaultValue: "" }
		},
		events: {
			rate: { allowPreventDefault: false, parameters: { value: "int" } }
		}
	},

	// CLAMPING: override the generated mutator on the prototype. The
	// metadata has no "setter" option in the classic extend API - a key
	// named setter is silently ignored. The mutator is called by BOTH
	// applySettings (construction) and the two-way binding write-back.
	setValue: function (this: {
		getMax(): number;
		setProperty(sName: string, oValue: unknown): boolean;
	}, iValue: number): boolean {
		return this.setProperty("value", Math.max(0, Math.min(this.getMax(), iValue)));
	},

	renderer: {
		apiVersion: 2,

		render: function (oRM: RenderManager, oRating: Element): void {
			const oCtrl = oRating as unknown as {
				getValue(): number;
				getMax(): number;
				getLabelText(): string;
			};
			// ARIA slider pattern (what sap.m's own RatingIndicator does):
			// role + focusability + value bounds. tabindex="0" is what lets
			// the keyboard reach the control's onkeydown; the screen reader
			// announces "name, slider, value" from aria-label + aria-valuenow.
			oRM.openStart("div", oRating)
				.attr("role", "slider")
				.attr("tabindex", "0")
				.attr("aria-valuemin", "0")
				.attr("aria-valuemax", String(oCtrl.getMax()))
				.attr("aria-valuenow", String(oCtrl.getValue()));
			if (oCtrl.getLabelText()) {
				oRM.attr("aria-label", oCtrl.getLabelText());
			}
			oRM.openEnd();
			for (let i = 1; i <= oCtrl.getMax(); i++) {
				oRM.openStart("span")
					.attr("data-rate", String(i))
					.class("lrStar" + (i <= oCtrl.getValue() ? " lrOn" : ""))
					.openEnd()
					.close("span");
			}
			oRM.close("div");
		}
	},

	// the framework-dispatched click handler - NOT wired in the renderer
	onclick: function (this: {
		getMax(): number;
		getValue(): number;
		setProperty(sName: string, oValue: unknown): boolean;
		fireRate(mParameters: { value: number }): boolean;
		_applyRate(iValue: number): void;
	}, oEvent: { target?: { dataset?: { rate?: string } } }): void {
		const sRate = oEvent.target?.dataset?.rate;
		if (sRate !== undefined) {
			this._applyRate(Number(sRate));
		}
	},

	// The keyboard leg of the slider pattern: arrows step, Home/End bound.
	// The framework dispatches onkeydown like onclick - but only when the
	// rendered DOM can hold focus, hence the renderer's tabindex="0".
	onkeydown: function (this: {
		getMax(): number;
		getValue(): number;
		_applyRate(iValue: number): void;
	}, oEvent: { key?: string; preventDefault(): void }): void {
		switch (oEvent.key) {
			case "ArrowUp":
			case "ArrowRight":
				oEvent.preventDefault();
				this._applyRate(this.getValue() + 1);
				break;
			case "ArrowDown":
			case "ArrowLeft":
				oEvent.preventDefault();
				this._applyRate(this.getValue() - 1);
				break;
			case "Home":
				oEvent.preventDefault();
				this._applyRate(0);
				break;
			case "End":
				oEvent.preventDefault();
				this._applyRate(this.getMax());
				break;
		}
	},

	_applyRate: function (this: {
		getValue(): number;
		setValue(iValue: number): boolean;
		fireRate(mParameters: { value: number }): boolean;
	}, iValue: number): void {
		// the clamping lives in the overridden mutator
		this.setValue(iValue);
		this.fireRate({ value: this.getValue() });
	}
});

export default RatingIndicator;
