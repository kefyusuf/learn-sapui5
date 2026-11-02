sap.ui.define([
	"learn/rating/control/RatingIndicator",
	"sap/ui/model/json/JSONModel"
], function (RatingIndicator, JSONModel) {
	"use strict";

	QUnit.module("RatingIndicator basics");

	QUnit.test("clamps the value into 0..max", function (assert) {
		assert.strictEqual(new RatingIndicator().getValue(), 0, "default value");
		assert.strictEqual(new RatingIndicator({ value: 9 }).getValue(), 5, "above max clamps down");
		assert.strictEqual(new RatingIndicator({ value: -2 }).getValue(), 0, "below zero clamps up");
	});

	QUnit.module("RatingIndicator interaction");

	QUnit.test("the click path fires rate and writes the value", function (assert) {
		const oRating = new RatingIndicator({ max: 5 });
		let iFired = -1;
		oRating.attachRate(function (oEvent) {
			iFired = oEvent.getParameter("value");
		});

		// the framework routes browser clicks to the control's onclick -
		// the renderer writes data-rate on every star span
		oRating.onclick({ target: { dataset: { rate: "4" } } });

		assert.strictEqual(oRating.getValue(), 4, "the clicked star becomes the value");
		assert.strictEqual(iFired, 4, "the rate event carries the value");
		oRating.destroy();
	});

	QUnit.test("out-of-range clicks clamp without firing nonsense", function (assert) {
		const oRating = new RatingIndicator({ max: 5 });
		let iFired = -1;
		oRating.attachRate(function (oEvent) {
			iFired = oEvent.getParameter("value");
		});

		oRating.onclick({ target: { dataset: { rate: "99" } } });

		assert.strictEqual(oRating.getValue(), 5, "clamped to max");
		assert.strictEqual(iFired, 5, "the event carries the clamped value");
		oRating.destroy();
	});

	QUnit.test("two-way: the property change writes the bound model", function (assert) {
		const oModel = new JSONModel({ rating: 0 });
		const oRating = new RatingIndicator();
		oRating.setModel(oModel);
		oRating.bindProperty("value", "/rating");

		oRating.onclick({ target: { dataset: { rate: "3" } } });

		assert.strictEqual(oModel.getProperty("/rating"), 3,
			"the model received the new value through the two-way binding");
		oRating.destroy();
	});

	QUnit.module("RatingIndicator rendering");

	QUnit.test("the renderer writes max star spans with the value on", function (assert) {
		const done = assert.async();
		const oRating = new RatingIndicator({ value: 2, max: 5 });
		oRating.placeAt("qunit-fixture");

		// the rerender is scheduled - give the UIArea a real moment
		// (Core.applyChanges is deprecated; the runner runs in real time)
		window.setTimeout(function () {
			const oDom = document.getElementById(oRating.getId());
			assert.strictEqual(oDom.querySelectorAll(".lrStar").length, 5, "max stars rendered");
			assert.strictEqual(oDom.querySelectorAll(".lrStar.lrOn").length, 2, "value stars highlighted");
			assert.strictEqual(oDom.querySelectorAll(".lrStar")[3].getAttribute("data-rate"), "4",
				"the star spans carry data-rate for the click path");
			oRating.destroy();
			done();
		}, 100);
	});
});
