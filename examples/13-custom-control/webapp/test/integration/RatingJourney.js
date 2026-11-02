/* Integration journey for example 13: the CUSTOM control inside the real
   app - the initial model value renders, a programmatic setValue goes
   through the two-way binding and the bound label follows. */
sap.ui.define([
	"sap/ui/test/opaQunit",
	"sap/ui/test/Opa5"
], function (opaTest, Opa5) {
	"use strict";

	const RatingPage = Opa5.extend("learn.rating.test.integration.pages.RatingPage", {

		iStartTheApp: function () {
			return this.iStartMyUIComponent({
				componentConfig: {
					name: "learn.rating",
					async: true
				}
			});
		},

		iTeardown: function () {
			return this.iTeardownMyUIComponent();
		},

		theRatingShowsValue: function (iValue) {
			return this.waitFor({
				controlType: "learn.rating.control.RatingIndicator",
				// a matcher (per control) - with controlType, check receives
				// every candidate at once (M18)
				matchers: function (oRating) {
					return oRating.getValue() === iValue;
				},
				success: function () {
					Opa5.assert.ok(true, `the custom control shows value ${iValue}`);
				},
				errorMessage: `The RatingIndicator never showed value ${iValue}`
			});
		},

		iRate: function (iValue) {
			return this.waitFor({
				controlType: "learn.rating.control.RatingIndicator",
				// the pragmatic action for a custom control: the method is
				// the public API - the click path is covered by the unit test
				actions: function (oRating) {
					oRating.setValue(iValue);
				},
				errorMessage: "Did not find the RatingIndicator"
			});
		},

		theLabelShows: function (sText) {
			return this.waitFor({
				viewName: "App",
				id: "ratingText",
				check: function (oText) {
					return oText.getText() === sText;
				},
				success: function () {
					Opa5.assert.ok(true, `the label shows "${sText}"`);
				},
				errorMessage: `The label never showed "${sText}"`
			});
		}
	});

	Opa5.extendConfig({
		arrangements: new RatingPage(),
		actions: new RatingPage(),
		assertions: new RatingPage(),
		viewNamespace: "learn.rating.view.",
		timeout: 60
	});

	opaTest("the custom control binds two-way against the app model", function (Given, When, Then) {
		Given.iStartTheApp();

		Then.theRatingShowsValue(2);

		When.iRate(4);

		Then.theRatingShowsValue(4)
			.and.theLabelShows("You rated 4 / 5")
			.and.iTeardown();
	});
});
