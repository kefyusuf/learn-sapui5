/* Page object for the sales order master-detail app - navigation flow. */
sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press",
	"sap/ui/test/matchers/PropertyStrictEquals"
], function (Opa5, Press, PropertyStrictEquals) {
	"use strict";
	return Opa5.extend("learn.routing.test.integration.pages.MasterDetailPage", {

		iStartTheApp: function () {
			return this.iStartMyUIComponent({
				componentConfig: {
					name: "learn.routing",
					async: true
				}
			});
		},

		iTeardown: function () {
			return this.iTeardownMyUIComponent();
		},

		iPressTheBackButton: function () {
			return this.waitFor({
				viewName: "Detail",
				// The Page auto-creates the nav button and it is the ONLY
				// sap.m.Button in this view - no matcher needed.
				controlType: "sap.m.Button",
				actions: new Press(),
				errorMessage: "Did not find the back button on the detail page"
			});
		},

		iPressOnOrder: function (sOrderId) {
			return this.waitFor({
				viewName: "Master",
				// ItemMatcher was removed from UI5 - the modern way to press
				// a list item: filter by controlType + property equality.
				controlType: "sap.m.StandardListItem",
				matchers: new PropertyStrictEquals({ name: "title", value: sOrderId }),
				actions: new Press(),
				errorMessage: `Did not find order "${sOrderId}" in the master list`
			});
		},

		theDetailShowsOrder: function (sOrderId, sCustomer) {
			return this.waitFor({
				viewName: "Detail",
				id: "objectHeader",
				success: function (oHeader) {
					Opa5.assert.strictEqual(oHeader.getTitle(), sOrderId,
						`detail shows order ${sOrderId}`);
					const oCustomer = oHeader.getAttributes()[0];
					Opa5.assert.strictEqual(oCustomer.getText(), sCustomer,
						`detail shows customer ${sCustomer}`);
				},
				errorMessage: "Did not reach the detail page"
			});
		},

		theMasterListIsVisible: function () {
			return this.waitFor({
				viewName: "Master",
				id: "orderList",
				// default visible: true - only succeeds when the master page
				// is actually displayed again
				success: function () {
					Opa5.assert.ok(true, "back on the master list");
				},
				errorMessage: "The master list is not visible after back navigation"
			});
		}
	});
});
