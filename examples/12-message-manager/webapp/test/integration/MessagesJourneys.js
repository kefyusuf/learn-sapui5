/* Integration journey for example 12: the intake form that talks back -
   a bad value in the Edm.Decimal field lands in the MessageManager, the
   bell counts it, the MessagePopover shows it; the fixed value saves. */
sap.ui.define([
	"sap/ui/test/opaQunit",
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press",
	"sap/ui/test/actions/EnterText"
], function (opaTest, Opa5, Press, EnterText) {
	"use strict";

	const MessagesPage = Opa5.extend("learn.v4messages.test.integration.pages.MessagesPage", {

		iStartTheApp: function () {
			return this.iStartMyUIComponent({
				componentConfig: {
					name: "learn.v4messages",
					async: true
				}
			});
		},

		iTeardown: function () {
			return this.iTeardownMyUIComponent();
		},

		iPressTheNewOrderButton: function () {
			return this.waitFor({
				viewName: "App",
				id: "newOrderButton",
				actions: new Press(),
				errorMessage: "Did not find the new-order button"
			});
		},

		iTypeInto: function (sFieldId, sValue) {
			return this.waitFor({
				viewName: "App",
				id: sFieldId,
				actions: new EnterText({ text: sValue }),
				errorMessage: `Did not find the "${sFieldId}" field (is the dialog open?)`
			});
		},

		iPressSave: function () {
			return this.waitFor({
				viewName: "App",
				id: "saveOrder",
				actions: new Press(),
				errorMessage: "Did not find the save button (is the dialog open?)"
			});
		},

		iPressTheCancelButton: function () {
			return this.waitFor({
				viewName: "App",
				id: "cancelOrder",
				actions: new Press(),
				errorMessage: "Did not find the cancel button (is the dialog open?)"
			});
		},

		iAcceptTheMessageBox: function () {
			return this.waitFor({
				controlType: "sap.m.Button",
				// MessageBox.error's single button renders as "Close" in this
				// version (confirm renders OK/Cancel) - accept both spellings
				matchers: function (oButton) {
					return oButton.getText() === "OK" || oButton.getText() === "Close";
				},
				actions: new Press(),
				errorMessage: "The 'fix the errors' MessageBox never appeared"
			});
		},

		iPressTheMessageButton: function () {
			return this.waitFor({
				viewName: "App",
				id: "messageButton",
				actions: new Press(),
				errorMessage: "Did not find the message (bell) button"
			});
		},

		theMessageButtonShowsCount: function (iCount) {
			return this.waitFor({
				viewName: "App",
				id: "messageButton",
				// the parse error lands asynchronously after the typing
				check: function (oButton) {
					return oButton.getText() === String(iCount);
				},
				success: function () {
					Opa5.assert.ok(true, `bell shows ${iCount} message(s)`);
				},
				errorMessage: `The bell never showed a count of ${iCount}`
			});
		},

		theMessagePopoverShowsAnError: function () {
			return this.waitFor({
				controlType: "sap.m.MessagePopover",
				// a matcher (per control) - with controlType, check receives
				// every candidate at once (M18)
				matchers: function (oPopover) {
					return oPopover.getItems().length > 0;
				},
				success: function () {
					Opa5.assert.ok(true, "the MessagePopover lists a message");
				},
				errorMessage: "The MessagePopover never showed a message"
			});
		},

		theTableShowsOrder: function (sOrderId) {
			return this.waitFor({
				viewName: "App",
				id: "ordersTable",
				// poll until the POST lands and the list shows the new row
				check: function (oTable) {
					return oTable.getItems().some((oItem) =>
						oItem.getCells()[0].getText() === sOrderId);
				},
				success: function () {
					Opa5.assert.ok(true, `table shows the new order ${sOrderId}`);
				},
				errorMessage: `The table never showed the new order ${sOrderId}`
			});
		},

		theDialogIsGone: function () {
			return this.waitFor({
				viewName: "App",
				id: "newOrderDialog",
				// a CLOSED dialog is unrendered - the default visible:true
				// filter would never match it
				visible: false,
				check: function (oDialog) {
					return !oDialog.isOpen();
				},
				success: function () {
					Opa5.assert.ok(true, "the dialog closed after save");
				},
				errorMessage: "The dialog never closed"
			});
		}
	});

	Opa5.extendConfig({
		arrangements: new MessagesPage(),
		actions: new MessagesPage(),
		assertions: new MessagesPage(),
		viewNamespace: "learn.v4messages.view.",
		timeout: 60
	});

	opaTest("shows the validation message in the MessagePopover", function (Given, When, Then) {
		Given.iStartTheApp()
			.and.iPressTheNewOrderButton();

		When.iTypeInto("customerInput", "Delta Traders")
			.and.iTypeInto("totalInput", "abc")
			.and.iPressSave()
			.and.iAcceptTheMessageBox()
			.and.iPressTheCancelButton();

		Then.theMessageButtonShowsCount(1);

		When.iPressTheMessageButton();

		Then.theMessagePopoverShowsAnError()
			.and.iTeardown();
	});

	opaTest("creates the order after the value is fixed", function (Given, When, Then) {
		Given.iStartTheApp()
			.and.iPressTheNewOrderButton();

		When.iTypeInto("customerInput", "Delta Traders")
			.and.iTypeInto("totalInput", "abc")
			.and.iPressSave()
			.and.iAcceptTheMessageBox()
			.and.iTypeInto("totalInput", "199.90")
			.and.iPressSave();

		Then.theDialogIsGone()
			.and.theTableShowsOrder("SO-2004")
			.and.iTeardown();
	});
});
