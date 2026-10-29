# 10 - Glossary: SAP Terms Decoded

The SAP world has its own vocabulary. These are the terms you will hear in your first weeks, with the one-sentence translation that matters.

## Runtime & Platform

| Term | Meaning |
|------|---------|
| **SAPUI5** | SAP's HTML5 UI framework (this repo). Closed-source sibling of OpenUI5. |
| **OpenUI5** | The open-source core of the same framework. Same API. |
| **Fiori** | SAP's UX design system + app patterns (and the launchpad). "A Fiori app" = an app following these patterns. |
| **Fiori Launchpad (FLP)** | The portal shell users log into; hosts apps, provides navigation, theming, services. Apps can run standalone (like here) or inside it. |
| **SAP BTP** | SAP Business Technology Platform - the cloud where apps/services are deployed (ABAP environment, Cloud Foundry, Kyma). |
| **SAPGUI / Dynpro** | The classic desktop SAP UI. Every modernization project moves screens from here to Fiori. |

## Backend & Data

| Term | Meaning |
|------|---------|
| **OData** | REST-based data protocol (the "SQL of the web" for SAP). V2 = older Gateway services; V4 = current standard. |
| **SAP Gateway** | The ABAP component that exposes OData V2 services from an SAP ERP system. |
| **RAP** | RESTful Application Programming Model - the modern ABAP way to build OData V4 services + Fiori Elements apps on BTP/on-premise. |
| **CAP** | Cloud Application Programming Model - build services in Node.js/Java on BTP. Often the backend of Fiori Elements apps. |
| **CDS** | Core Data Services - the modeling language (annotations, entities) used by RAP and CAP. |
| **SEGW** | Transaction "Gateway Service Builder" - the classic (pre-RAP) tool to model OData V2 services in ABAP. |
| **Entity Set** | A collection of entities in OData (`/Products`) - what you bind lists to. |
| **$metadata** | The machine-readable schema of an OData service. The first thing to check when a service "does not work". |
| **Draft** | FE pattern where edits are saved to a draft copy until "Save" - enables collaborative editing. |

## UI Layer

| Term | Meaning |
|------|---------|
| **Freestyle app** | A UI5 app where you write views/controllers yourself (examples 01-08). |
| **Fiori Elements (FE)** | Template-generated apps from metadata + annotations (example 09). |
| **List Report / Object Page** | The two most common FE floor plans: searchable list → detail page. |
| **Floorplan** | FE terminology for an app "layout type". |
| **Annotation** | Declarative metadata (`UI.LineItems`, `Common.Label`) that drives FE rendering and semantics. |
| **manifest.json** | The app descriptor: id, models, libraries, routing, data sources. |
| **Component** | The application object every UI5 app is built around. |
| **FLP plugin / custom app** | How your app gets deployed into a launchpad. |

## Development & Tooling

| Term | Meaning |
|------|---------|
| **UI5 CLI** | The build/dev server (`ui5 serve`, `ui5 build`) - the heart of local development. |
| **ui5.yaml** | Project config for the CLI: framework version, middlewares, tasks. |
| **Middleware / Task** | Server extension (proxy, transpile, mock) / build step. |
| **BAS** | SAP Business Application Studio - SAP's cloud IDE (VS Code fork) with Fiori generators. |
| **Fiori tools** | The generator/scaffold extensions in BAS/VS Code for FE apps. |
| **MockServer** | Simulates an OData service locally from metadata + JSON (examples 06/07). |
| **Transport request** | How ABAP changes move between systems (dev → QA → prod). UI5 apps on BTP deploy via MTA/CI instead. |
| **T-code** | "Transaction code" - command-line navigation in classic SAP systems (SEGW, SE80). |

## Reading order when a term blocks you

1. This glossary for the one-liner.
2. [docs/04-odata-and-models.md](04-odata-and-models.md) if it is a data term.
3. [docs/06-freestyle-vs-fiori-elements.md](06-freestyle-vs-fiori-elements.md) if it is an app-type term.
4. The official SAP terminology documentation for the deep definition.
