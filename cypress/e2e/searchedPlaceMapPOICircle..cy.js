/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */
/// <reference types="cypress" />

//STR
// 1-Go to https://qa.amazonlocation.services/demo
// 2-User clicks on the search field
// 3-User searches a location e.g.Rio tinto
// 4-Verify the searched place is displayed on the map as a POI circle

describe("Verify that the searched place will be displayed on the map as a POI circle.", () => {
	it("authentication", { scrollBehavior: false }, () => {
		cy.visit(Cypress.env("URL"), {
			auth: {
				username: Cypress.env("USERNAME"),
				password: Cypress.env("PASSWORD")
			}
		});
		cy.wait(25000);
		cy.get('[placeholder="Search"]').click().type("Rio tinto").type("{enter}");
		cy.wait(10000);
		cy.get("div").should("contain", "Rio Tinto");
		cy.wait(2000);
		cy.get("div").should("contain", "Rio Tinto");
		cy.wait(2000);
		cy.get("div").should("contain", "Rio Tinto");
		cy.wait(2000);
		cy.get("div").should("contain", "Rio Tinto");
		cy.wait(2000);
		cy.get("div").should("contain", "Rio Tinto");
		cy.wait(2000);
		cy.get("div").should("contain", "Rio Tinto");
		cy.wait(2000);
		cy.get("div").should("contain", "Rio Tinto");
		cy.wait(2000);
		cy.get("div").should("contain", "Rio Tinto");
		cy.wait(2000);
		cy.get("div").should("contain", "Rio Tinto");
		cy.wait(2000);
	});
});