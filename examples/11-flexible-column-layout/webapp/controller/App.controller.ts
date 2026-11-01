import Controller from "sap/ui/core/mvc/Controller";
import UIComponent from "sap/ui/core/UIComponent";
import FlexibleColumnLayout from "sap/f/FlexibleColumnLayout";

/**
 * @namespace learn.fcl.controller
 *
 * The FCL layout switching is handled by the sap.f.routing.Router via the
 * route-level "layout" properties in the manifest (OneColumn for master,
 * TwoColumnsMidExpanded for detail) - no manual layout code needed here.
 */
export default class AppController extends Controller {}
